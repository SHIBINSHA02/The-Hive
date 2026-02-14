// services/geminiService.ts

export const generateReminderEmail = async (contract) => {
  const isOverdue = contract?.status === "overdue";

  return `
Dear ${contract?.clientName || "Valued Client"},

This is a ${isOverdue ? "final reminder" : "friendly reminder"} regarding your contract:
"${contract?.contractTitle || "your contract"}"

${
  isOverdue
    ? `The payment of ${contract?.amount || "the pending amount"} is now overdue. We kindly request that you settle this immediately to avoid further delays.`
    : `The deadline is approaching on ${contract?.deadline || "the scheduled date"}. Please ensure everything is completed within the agreed timeline.`
}

If you have already completed this, kindly ignore this message.

Best regards,
Contract Lifecycle Team
`;
};
