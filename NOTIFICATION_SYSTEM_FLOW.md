# Notification System - Complete Flow Explanation

## Overview

The notification system is **fully dynamic** - it generates notifications automatically based on real contract data in your database. Here's how it works:

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. SEED DATA (One-Time Setup)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Seed Script Creates:                                           │
│  • Users (or uses existing)                                     │
│  • Client/Contractor Profiles                                    │
│  • Contracts (with different statuses)                          │
│  • Finance Records (with payment milestones)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. NOTIFICATION GENERATION                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Notification Service Scans:                                    │
│  • All contracts for each user                                  │
│  • Contract statuses (pending/active/completed)                  │
│  • Contract deadlines                                           │
│  • Payment milestones and due dates                             │
│  • Finance payment status                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Generates Notifications Based on Rules:                        │
│  • Pending contract → "Contract Agreement Request"              │
│  • Active contract expiring in 30 days → "Contract Expiring"    │
│  • Payment milestone due in 30 days → "Payment Due Soon"        │
│  • Payment overdue → "Payment Overdue"                          │
│  • Contract completed → "Contract Completed"                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. STORAGE                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Notifications Saved to Database:                               │
│  • Linked to specific user                                      │
│  • Linked to specific contract                                   │
│  • Includes priority, status, actions                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. DISPLAY                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend Fetches:                                               │
│  • GET /api/notifications → Returns user's notifications        │
│  • Dashboard shows notifications                                │
│  • Summary cards calculated from notifications                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Detailed Step-by-Step Flow

### Step 1: Seed Data Creation

**File:** `db/seed.ts`

**Purpose:** Creates initial test data to demonstrate the system

**What it does:**
1. **Creates/uses users:**
   ```typescript
   // Uses existing users OR creates sample users
   const users = await User.find({});
   ```

2. **Creates profiles for each user:**
   ```typescript
   // Each user gets both client and contractor profiles
   const client = await ClientProfile.create({ user: user._id });
   const contractor = await ContractProfile.create({ user: user._id });
   ```

3. **Creates contracts with different scenarios:**
   ```typescript
   // Creates contracts with different statuses:
   // - Pending (0-4): Will trigger "Contract Agreement Request"
   // - Active expiring soon (5-9): Will trigger "Contract Expiring Soon"
   // - Active normal (10-12): Regular contracts
   // - Completed (13-14): Will trigger "Contract Completed"
   ```

4. **Creates finance records with payment milestones:**
   ```typescript
   // Each contract gets finance record with 3 milestones:
   // - Phase 1: Already paid (past)
   // - Phase 2: Due soon (1-7 days) → Triggers "Payment Due Soon"
   // - Phase 3: Due later or overdue → Triggers "Payment Overdue"
   ```

### Step 2: Notification Generation Logic

**File:** `lib/notificationService.ts`

**Function:** `generateUserNotifications(userId)`

**How it works:**

#### 2.1 Fetch User's Contracts
```typescript
// Gets all contracts where user is either client OR contractor
const contracts = await Contract.find({ 
  $or: [
    { client: clientProfile._id },
    { contractor: contractorProfile._id }
  ]
});
```

#### 2.2 Fetch Finance Data
```typescript
// Gets payment information for each contract
const financeRecords = await Financial.find({
  contract: { $in: contractIds }
});
```

#### 2.3 Analyze Each Contract

For each contract, the system checks:

**A. Contract Status = "pending"**
```typescript
if (contract.contractStatus === 'pending') {
  // Creates "Contract Agreement Request" notification
  // Priority: urgent if deadline < 3 days, high if < 7 days, else medium
}
```

**B. Contract Status = "active" AND deadline approaching**
```typescript
if (contract.contractStatus === 'active') {
  const daysUntilDeadline = calculateDays(contract.deadline);
  if (daysUntilDeadline <= 30 && daysUntilDeadline > 0) {
    // Creates "Contract Expiring Soon" notification
    // Priority based on days remaining
  }
}
```

**C. Payment Milestones**
```typescript
for (const milestone of finance.milestones) {
  if (!milestone.isPaid) {
    const daysUntilDue = calculateDays(milestone.dueDate);
    if (daysUntilDue <= 30 && daysUntilDue >= -7) {
      // Creates "Payment Due Soon" or "Payment Overdue" notification
      // Status: "overdue" if past due, "pending" if upcoming
    }
  }
}
```

**D. Payment Status = "overdue"**
```typescript
if (finance.paymentStatus === 'overdue' && finance.dueAmount > 0) {
  // Creates "Payment Overdue" alert notification
  // Priority: urgent
}
```

**E. Contract Status = "completed"**
```typescript
if (contract.contractStatus === 'completed') {
  const daysSinceCompletion = calculateDays(contract.deadline);
  if (daysSinceCompletion <= 7) {
    // Creates "Contract Completed" update notification
  }
}
```

#### 2.4 Prevent Duplicates
```typescript
// Checks if notification already exists before creating
const existingNotification = await Notification.findOne({
  user: userId,
  contract: contract._id,
  type: 'request',
  status: 'pending'
});
```

#### 2.5 Save Notifications
```typescript
// Bulk insert all generated notifications
await Notification.insertMany(notificationsToCreate);
```

### Step 3: When Notifications Are Generated

#### Option A: During Seed (Automatic)
```typescript
// In seed.ts, after creating contracts:
const { generateAllUserNotifications } = await import("../lib/notificationService.js");
const result = await generateAllUserNotifications();
// Generates notifications for ALL users
```

#### Option B: Daily Cron Job (Automatic)
```typescript
// File: app/api/notifications/generate/route.ts
// Called daily at midnight (configured in vercel.json)
export async function POST() {
  const result = await generateAllUserNotifications();
  // Scans all users and generates notifications
}
```

#### Option C: Manual Trigger (On-Demand)
```bash
# Via API call
GET /api/notifications/generate
# Or
POST /api/notifications/generate
```

### Step 4: Frontend Display

**File:** `app/(protected)/dashboard/notifications/page.tsx`

**Flow:**
1. Component mounts
2. Fetches notifications: `GET /api/notifications`
3. API returns user's notifications (sorted by priority)
4. Displays in UI with:
   - Summary cards (calculated from notifications)
   - Filter tabs
   - Notification list

## 🎯 Why Seed Data is Used

### 1. **Testing & Development**
- Provides realistic data to test the notification system
- Demonstrates all notification types
- Shows how the system works with actual contracts

### 2. **Demonstration**
- Shows stakeholders how notifications work
- Provides sample data for UI/UX testing
- Helps understand the system behavior

### 3. **Development Workflow**
- Developers can test without creating contracts manually
- Consistent test data across team
- Easy to reset and reseed

### 4. **Production vs Development**
- **Development:** Use seed data for testing
- **Production:** Real contracts from actual users
- **Both:** Use the same notification generation logic

## 🔍 Key Concepts

### Notification Generation is Rule-Based

The system doesn't store "notification templates" - it **dynamically generates** notifications by analyzing contract data:

```typescript
// Example Rule:
IF contract.status === "pending" 
AND contract.deadline < 3 days
THEN create "Contract Agreement Request" notification with priority "urgent"
```

### Notifications are User-Specific

Each notification is:
- **Linked to a user** (`user: ObjectId`)
- **Linked to a contract** (`contract: ObjectId`)
- **Generated based on that user's contracts**

### Notifications are Persistent

- Stored in MongoDB (`Notification` collection)
- Not regenerated on every page load
- Only regenerated when:
  - Daily cron job runs
  - Manual trigger via API
  - New contracts are created (if you add that logic)

### Duplicate Prevention

The system checks for existing notifications before creating new ones:
```typescript
// Prevents creating duplicate "Contract Expiring Soon" notifications
// within 7 days
const existingNotification = await Notification.findOne({
  user: userId,
  contract: contract._id,
  type: 'alert',
  title: 'Contract Expiring Soon',
  createdAt: { $gte: sevenDaysAgo }
});
```

## 📊 Example: Complete Flow for One User

### Initial State
- User: `user_39FHsCsyf0shVkgpaV0dQ6Hnt1e`
- No contracts, no notifications

### After Running Seed Script

1. **Seed creates:**
   - ClientProfile for user
   - ContractorProfile for user
   - 5 contracts (mix of pending/active/completed)
   - Finance records with milestones

2. **Seed triggers notification generation:**
   ```
   generateAllUserNotifications()
   → Finds user
   → Finds user's contracts (5 contracts)
   → Analyzes each contract:
     - Contract 1 (pending, 2 days): Creates "Contract Agreement Request" (urgent)
     - Contract 2 (active, 15 days): Creates "Contract Expiring Soon" (medium)
     - Contract 3 (active, milestone due in 3 days): Creates "Payment Due Soon" (urgent)
     - Contract 4 (active, milestone overdue): Creates "Payment Overdue" (urgent)
     - Contract 5 (completed, 2 days ago): Creates "Contract Completed" (low)
   → Saves 5 notifications to database
   ```

3. **User visits dashboard:**
   - Frontend calls `GET /api/notifications`
   - API returns 5 notifications
   - Dashboard displays:
     - Summary: 1 Pending Request, 1 Active Alert, 2 Pending Payments
     - List of 5 notifications

### Daily Cron Job (Next Day)

1. **Cron job runs at midnight:**
   ```
   POST /api/notifications/generate
   → Scans all users
   → For each user, analyzes their contracts
   → Creates new notifications if:
     - New contracts were added
     - Contract statuses changed
     - Payment milestones became due
     - Contracts expired
   → Updates notification counts
   ```

## 🛠️ Customization

### Adding New Notification Types

1. **Add to notification service:**
   ```typescript
   // In lib/notificationService.ts
   if (someCondition) {
     notificationsToCreate.push({
       user: userId,
       type: 'alert', // or 'request', 'payment', 'update'
       title: 'Your Custom Notification',
       description: 'Description here',
       priority: 'high',
       // ... other fields
     });
   }
   ```

2. **Update types:**
   ```typescript
   // In types/notification.ts
   export type NotificationType = 'request' | 'alert' | 'payment' | 'update' | 'custom';
   ```

### Changing Notification Rules

Edit the conditions in `lib/notificationService.ts`:
```typescript
// Example: Change expiration alert from 30 days to 60 days
if (daysUntilDeadline > 0 && daysUntilDeadline <= 60) { // Changed from 30
  // Create notification
}
```

## 📝 Summary

1. **Seed Data** = Initial test data (contracts, finance records)
2. **Notification Service** = Analyzes contracts and generates notifications
3. **Database** = Stores notifications persistently
4. **Frontend** = Displays notifications to users
5. **Cron Job** = Automatically regenerates notifications daily

The system is **fully dynamic** - it reads real contract data and generates notifications based on business rules, not hardcoded values.
