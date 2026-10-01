import { ExpenseParticipant } from '../../types/groupExpense';

/**
 * Calculates amounts from percentage split.
 * Automatically computes each person's monetary share from percentage.
 */
export const calculatePercentageSplit = (
  totalAmount: number,
  percentages: Record<string, number>
): ExpenseParticipant[] => {
  const userIds = Object.keys(percentages);
  if (userIds.length === 0) return [];

  let accumulatedAmount = 0;
  const result: ExpenseParticipant[] = [];

  userIds.forEach((userId, index) => {
    const pct = percentages[userId] || 0;
    if (index === userIds.length - 1) {
      // Last participant gets exact difference to eliminate any fractional penny round-off
      const finalAmount = Number(Math.max(0, totalAmount - accumulatedAmount).toFixed(2));
      result.push({
        userId,
        amount: finalAmount,
        percentage: pct,
      });
    } else {
      const share = Number(((pct / 100) * totalAmount).toFixed(2));
      accumulatedAmount += share;
      result.push({
        userId,
        amount: share,
        percentage: pct,
      });
    }
  });

  return result;
};
