import {
  Group,
  GroupBalanceCalculation,
  GroupExpense,
  GroupMember,
  GroupSettlement,
  MemberBalanceInfo,
} from '../../types/groupExpense';
import { simplifyDebts } from './simplifyDebts';

/**
 * Dynamically computes all group balances, individual member net balances,
 * pairwise user balances, and simplified debt transactions.
 */
export const calculateBalances = (
  group: Group,
  expenses: GroupExpense[],
  settlements: GroupSettlement[] = [],
  currentUserId?: string
): GroupBalanceCalculation => {
  const members = group.members || [];
  const memberMap = new Map<string, GroupMember>();
  members.forEach((m) => memberMap.set(m.id, m));

  const currentMember =
    members.find((m) => m.id === currentUserId || m.isCurrentUser) || members[0];
  const effectiveCurrentUserId = currentMember ? currentMember.id : '';

  // 1. Initialize stats per member
  const totalPaidMap: Record<string, number> = {};
  const totalShareMap: Record<string, number> = {};
  const settlementsPaidMap: Record<string, number> = {};
  const settlementsReceivedMap: Record<string, number> = {};
  const netBalances: Record<string, number> = {};

  // Pairwise directed balances: pairwise[A][B] > 0 means B owes A that amount
  const pairwise: Record<string, Record<string, number>> = {};

  members.forEach((m) => {
    totalPaidMap[m.id] = 0;
    totalShareMap[m.id] = 0;
    settlementsPaidMap[m.id] = 0;
    settlementsReceivedMap[m.id] = 0;
    netBalances[m.id] = 0;
    pairwise[m.id] = {};
    members.forEach((other) => {
      if (other.id !== m.id) {
        pairwise[m.id][other.id] = 0;
      }
    });
  });

  let totalExpenseAmount = 0;

  // 2. Process all expenses
  expenses.forEach((expense) => {
    totalExpenseAmount += expense.amount;
    const payerId = expense.paidBy;

    if (totalPaidMap[payerId] !== undefined) {
      totalPaidMap[payerId] += expense.amount;
    } else {
      totalPaidMap[payerId] = expense.amount;
    }

    // Process participant shares
    expense.participants.forEach((p) => {
      if (totalShareMap[p.userId] !== undefined) {
        totalShareMap[p.userId] += p.amount;
      } else {
        totalShareMap[p.userId] = p.amount;
      }

      // If participant is different from payer, participant owes payer
      if (p.userId !== payerId) {
        if (!pairwise[payerId]) pairwise[payerId] = {};
        if (!pairwise[p.userId]) pairwise[p.userId] = {};

        pairwise[payerId][p.userId] = (pairwise[payerId][p.userId] || 0) + p.amount;
      }
    });
  });

  // 3. Process all settlements
  settlements.forEach((settlement) => {
    const { fromUserId, toUserId, amount } = settlement;
    settlementsPaidMap[fromUserId] = (settlementsPaidMap[fromUserId] || 0) + amount;
    settlementsReceivedMap[toUserId] = (settlementsReceivedMap[toUserId] || 0) + amount;

    // Settlement reduces debt: fromUser pays toUser, so toUser's credit over fromUser decreases
    if (pairwise[toUserId] && pairwise[toUserId][fromUserId] !== undefined) {
      pairwise[toUserId][fromUserId] -= amount;
    } else {
      if (!pairwise[toUserId]) pairwise[toUserId] = {};
      pairwise[toUserId][fromUserId] = (pairwise[toUserId][fromUserId] || 0) - amount;
    }
  });

  // 4. Compute net balances for each user
  members.forEach((m) => {
    const paid = totalPaidMap[m.id] || 0;
    const share = totalShareMap[m.id] || 0;
    const settledPaid = settlementsPaidMap[m.id] || 0;
    const settledRecv = settlementsReceivedMap[m.id] || 0;

    const net = (paid - share) + (settledRecv - settledPaid);
    netBalances[m.id] = Number(net.toFixed(2));
  });

  // 5. Build MemberBalanceInfo list relative to current user
  const memberBalances: MemberBalanceInfo[] = members
    .filter((m) => m.id !== effectiveCurrentUserId)
    .map((m) => {
      // Direct balance between current user and this member:
      // What member owes current user minus what current user owes member
      const memberOwesMe = pairwise[effectiveCurrentUserId]?.[m.id] || 0;
      const meOwesMember = pairwise[m.id]?.[effectiveCurrentUserId] || 0;
      const directNet = Number((memberOwesMe - meOwesMember).toFixed(2));

      return {
        member: m,
        netBalance: netBalances[m.id] || 0,
        userOwedAmount: directNet,
        totalPaid: totalPaidMap[m.id] || 0,
        totalShare: totalShareMap[m.id] || 0,
      };
    });

  // 6. Compute Simplified Debts
  const simplified = simplifyDebts(netBalances, members);

  const myNetBalance = netBalances[effectiveCurrentUserId] || 0;

  return {
    totalExpense: Number(totalExpenseAmount.toFixed(2)),
    netBalances,
    myNetBalance,
    memberBalances,
    pairwiseBalances: pairwise,
    simplifiedDebts: simplified,
  };
};
