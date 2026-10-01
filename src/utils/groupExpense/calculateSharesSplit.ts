import { ExpenseParticipant } from '../../types/groupExpense';

/**
 * Calculates member split amounts by proportional shares.
 * e.g., Akshay 1, Rahul 1, Sonali 2, Pratik 1 => Total 5 shares.
 */
export const calculateSharesSplit = (
  totalAmount: number,
  shares: Record<string, number>
): ExpenseParticipant[] => {
  const userIds = Object.keys(shares);
  if (userIds.length === 0) return [];

  const totalShares = userIds.reduce((sum, id) => sum + (shares[id] || 0), 0);
  if (totalShares <= 0) {
    return userIds.map(userId => ({ userId, amount: 0, shares: shares[userId] || 0 }));
  }

  let accumulatedAmount = 0;
  const result: ExpenseParticipant[] = [];

  userIds.forEach((userId, index) => {
    const memberShare = shares[userId] || 0;
    if (index === userIds.length - 1) {
      const finalAmount = Number(Math.max(0, totalAmount - accumulatedAmount).toFixed(2));
      result.push({
        userId,
        amount: finalAmount,
        shares: memberShare,
      });
    } else {
      const memberAmount = Number(((memberShare / totalShares) * totalAmount).toFixed(2));
      accumulatedAmount += memberAmount;
      result.push({
        userId,
        amount: memberAmount,
        shares: memberShare,
      });
    }
  });

  return result;
};
