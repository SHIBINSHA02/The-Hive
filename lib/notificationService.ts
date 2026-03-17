// lib/notificationService.ts
import mongoose from "mongoose";
import Notification from "@/db/models/Notification";
import Contract from "@/db/models/Contract";
import Financial from "@/db/models/Finance";
import ClientProfile from "@/db/models/ClientProfile";
import ContractProfile from "@/db/models/ContractProfile";
import User from "@/db/models/User";

interface NotificationData {
  user: mongoose.Types.ObjectId;
  type: 'request' | 'alert' | 'payment' | 'update';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'overdue';
  contractName?: string;
  contractId?: string;
  contract?: mongoose.Types.ObjectId;
  amount?: number;
  dueDate?: Date;
  sender?: string;
  senderAvatar?: string;
  actions?: Array<{
    label: string;
    type: 'primary' | 'secondary' | 'destructive';
    action: string;
  }>;
}

/**
 * Generates notifications for a specific user based on their contracts
 */
export async function generateUserNotifications(userId: mongoose.Types.ObjectId): Promise<void> {
  const user = await User.findById(userId);
  if (!user) return;

  // Get user profiles
  const clientProfile = await ClientProfile.findOne({ user: userId });
  const contractorProfile = await ContractProfile.findOne({ user: userId });

  // 1. Use the robust query array to catch Owner, Party B, and Profile links
  const userEmails = user.email ? [user.email.toLowerCase().trim()] : [];
  const conditions: Record<string, unknown>[] = [
    { ownerId: user.clerkId },
    { partyB_ClerkId: user.clerkId }
  ];
  if (userEmails.length > 0) conditions.push({ partyB_Email: { $in: userEmails } });
  if (clientProfile) conditions.push({ client: clientProfile._id });
  if (contractorProfile) conditions.push({ contractor: contractorProfile._id });

  // Fetch all contracts for the user
  const contracts = await Contract.find({ $or: conditions })
    .populate("client")
    .populate("contractor")
    .lean();

  if (!contracts.length) return;

  // Fetch finance data for all contracts
  const contractIds = contracts.map((c) => c._id);
  const financeRecords = await Financial.find({
    contract: { $in: contractIds },
  }).lean();

  // Create a map of contract ID to finance data
  const financeMap = new Map(
    financeRecords.map((f) => {
      const contractId = typeof f.contract === 'object' && f.contract?._id
        ? f.contract._id.toString()
        : f.contract.toString();
      return [contractId, f];
    })
  );

  const now = new Date();
  const notificationsToCreate: NotificationData[] = [];

  for (const contract of contracts) {
    const contractDeadline = new Date(contract.deadline);
    const isUserClient = contract.client &&
      (typeof contract.client === 'object' ? (contract.client as any)._id?.toString() : (contract.client as any).toString()) ===
      (clientProfile?._id.toString() || '');

    const otherParty = isUserClient ? contract.contractor : contract.client;
    const otherPartyName = typeof otherParty === 'object'
      ? ((otherParty as any)?.name || contract.companyName || 'Unknown')
      : contract.companyName || 'Unknown';

    // Determine if it's actually this user's turn to act
    const isOwner = contract.ownerId === user.clerkId;
    const myTurn = (isOwner && contract.currentTurn === "owner") || (!isOwner && contract.currentTurn === "partyB");

    // 1. Contract Agreement Request (pending contracts / negotiations)
    if (myTurn && (contract.contractStatus === 'sent_for_review' || contract.contractStatus === 'in_negotiation')) {
      const daysUntilDeadline = Math.ceil((contractDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const priority: 'low' | 'medium' | 'high' | 'urgent' =
        daysUntilDeadline <= 3 ? 'urgent' :
            daysUntilDeadline <= 7 ? 'high' : 'medium';

      // Check if notification already exists
      const existingNotification = await Notification.findOne({
        user: userId,
        contract: contract._id,
        type: 'request',
        status: 'pending'
      });

      if (!existingNotification) {
        notificationsToCreate.push({
          user: userId,
          type: 'request',
          title: 'Action Required: Your Turn',
          description: `${otherPartyName} has passed the pen. It is your turn to review the ${contract.contractTitle}.`,
          priority,
          status: 'pending',
          contractName: contract.contractTitle,
          contractId: contract.contractId,
          contract: contract._id,
          sender: otherPartyName,
          senderAvatar: otherPartyName.substring(0, 2).toUpperCase(),
          actions: [
            { label: 'Review Now', type: 'primary', action: 'review' }
          ],
        });
      }
    }

    // 2. Contract Expiring Soon (active contracts approaching deadline)
    if (contract.contractStatus === 'active') {
      const daysUntilDeadline = Math.ceil((contractDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline > 0 && daysUntilDeadline <= 30) {
        const priority: 'low' | 'medium' | 'high' | 'urgent' =
          daysUntilDeadline <= 3 ? 'urgent' :
            daysUntilDeadline <= 7 ? 'high' : 'medium';

        // Check if notification already exists (within last 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const existingNotification = await Notification.findOne({
          user: userId,
          contract: contract._id,
          type: 'alert',
          title: 'Contract Expiring Soon',
          createdAt: { $gte: sevenDaysAgo }
        });

        if (!existingNotification) {
          notificationsToCreate.push({
            user: userId,
            type: 'alert',
            title: 'Contract Expiring Soon',
            description: `The ${contract.contractTitle} with ${contract.companyName} expires in ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}. Consider renewal.`,
            priority,
            status: 'pending',
            contractName: contract.contractTitle,
            contractId: contract.contractId,
            contract: contract._id,
            dueDate: contractDeadline,
            actions: [
              { label: 'View Contract', type: 'primary', action: 'view' },
              { label: 'Archive', type: 'secondary', action: 'archive' }
            ],
          });
        }
      }
    }

    // 3. Payment notifications from finance data
    const finance = financeMap.get(contract._id.toString());
    if (finance && finance.dueAmount > 0) {
      const daysUntilDue = Math.ceil((contractDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Check if notification already exists for this milestone
      const existingNotification = await Notification.findOne({
        user: userId,
        contract: contract._id,
        type: 'payment',
        amount: finance.dueAmount
      });

      if (!existingNotification && daysUntilDue <= 14) {
        notificationsToCreate.push({
          user: userId,
          type: 'payment',
          title: daysUntilDue < 0 ? 'Payment Overdue' : 'Payment Due Soon',
          description: daysUntilDue < 0
            ? `Payment of $${finance.dueAmount.toLocaleString()} for the ${contract.contractTitle} is ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue.`
            : `Payment of $${finance.dueAmount.toLocaleString()} for the ${contract.contractTitle} is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}.`,
          priority: daysUntilDue < 0 ? 'urgent' : 'high',
          status: daysUntilDue < 0 ? 'overdue' : 'pending',
          contractName: contract.contractTitle,
          contractId: contract.contractId,
          contract: contract._id,
          amount: finance.dueAmount,
          dueDate: contractDeadline,
          actions: [
            { label: 'Pay Now', type: 'primary', action: 'pay' },
            { label: 'View Details', type: 'secondary', action: 'view' }
          ],
        });
      }
    }

    // 4. Contract status updates (completed contracts)
    if (contract.contractStatus === 'completed') {
      const completedDate = new Date(contract.deadline); // assuming deadline becomes completion date
      const daysSinceCompletion = Math.ceil((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceCompletion >= 0 && daysSinceCompletion <= 7) {
        const existingNotification = await Notification.findOne({
          user: userId,
          contract: contract._id,
          type: 'update',
          title: 'Contract Completed'
        });

        if (!existingNotification) {
          notificationsToCreate.push({
            user: userId,
            type: 'update',
            title: 'Contract Completed',
            description: `The ${contract.contractTitle} has been completed and is now archived.`,
            priority: 'low',
            status: 'completed',
            contractName: contract.contractTitle,
            contractId: contract.contractId,
            contract: contract._id,
            actions: [
              { label: 'View Contract', type: 'primary', action: 'view' },
            ],
          });
        }
      }
    }
  }

  // Bulk insert notifications
  if (notificationsToCreate.length > 0) {
    await Notification.insertMany(notificationsToCreate);
  }
}

/**
 * Generates notifications for all users (called by daily cron job)
 */
export async function generateAllUserNotifications(): Promise<{ success: boolean; usersProcessed: number; notificationsCreated: number }> {
  try {
    const users = await User.find({});
    let totalNotifications = 0;

    for (const user of users) {
      const beforeCount = await Notification.countDocuments({ user: user._id });
      await generateUserNotifications(user._id);
      const afterCount = await Notification.countDocuments({ user: user._id });
      totalNotifications += (afterCount - beforeCount);
    }

    return {
      success: true,
      usersProcessed: users.length,
      notificationsCreated: totalNotifications
    };
  } catch (error) {
    console.error('Error generating notifications for all users:', error);
    throw error;
  }
}