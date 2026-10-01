import { GroupMember, SimplifiedDebt } from '../../types/groupExpense';

/**
 * Simplifies a group's debt graph into the minimum practical number of direct transfers.
 *
 * Algorithm:
 * 1. Collect net balance for every member.
 * 2. Separate into creditors (balance > 0) and debtors (balance < 0).
 * 3. Sort both descending by absolute magnitude.
 * 4. Greedily match the highest debtor with the highest creditor.
 * 5. Create transfer, reduce balances, and repeat until settled.
 */
export const simplifyDebts = (
  netBalances: Record<string, number>,
  members: GroupMember[]
): SimplifiedDebt[] => {
  const memberMap = new Map<string, GroupMember>();
  members.forEach((m) => memberMap.set(m.id, m));

  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  Object.entries(netBalances).forEach(([userId, balance]) => {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded > 0.01) {
      creditors.push({ id: userId, amount: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ id: userId, amount: Math.abs(rounded) });
    }
  });

  const transactions: SimplifiedDebt[] = [];

  // Sort descending by magnitude
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const settleAmount = Number(Math.min(creditor.amount, debtor.amount).toFixed(2));

    if (settleAmount > 0.01) {
      const fromMember = memberMap.get(debtor.id);
      const toMember = memberMap.get(creditor.id);

      transactions.push({
        fromUserId: debtor.id,
        fromUserName: fromMember ? (fromMember.isCurrentUser ? 'You' : fromMember.name) : 'Member',
        fromUserInitials: fromMember?.initials,
        toUserId: creditor.id,
        toUserName: toMember ? (toMember.isCurrentUser ? 'you' : toMember.name) : 'Member',
        toUserInitials: toMember?.initials,
        amount: settleAmount,
      });
    }

    creditor.amount = Number((creditor.amount - settleAmount).toFixed(2));
    debtor.amount = Number((debtor.amount - settleAmount).toFixed(2));

    if (creditor.amount <= 0.01) {
      cIdx++;
    }
    if (debtor.amount <= 0.01) {
      dIdx++;
    }
  }

  return transactions;
};
