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
  members.forEach((m) => memberMap.set(String(m.id), m));

  const currentMember =
    members.find((m) => String(m.id) === String(currentUserId) || m.isCurrentUser) || members[0];
  const effectiveCurrentUserId = currentMember ? String(currentMember.id) : '';

  // 1. Initialize stats per member
  const totalPaidMap: Record<string, number> = {};
  const totalShareMap: Record<string, number> = {};
  const settlementsPaidMap: Record<string, number> = {};
  const settlementsReceivedMap: Record<string, number> = {};
  const netBalances: Record<string, number> = {};

  // Pairwise directed balances: pairwise[A][B] > 0 means B owes A that amount
  const pairwise: Record<string, Record<string, number>> = {};

  members.forEach((m) => {
    const mId = String(m.id);
    totalPaidMap[mId] = 0;
    totalShareMap[mId] = 0;
    settlementsPaidMap[mId] = 0;
    settlementsReceivedMap[mId] = 0;
    netBalances[mId] = 0;
    pairwise[mId] = {};
    members.forEach((other) => {
      const otherId = String(other.id);
      if (otherId !== mId) {
        pairwise[mId][otherId] = 0;
      }
    });
  });

  let totalExpenseAmount = 0;
  console.log("###### expenses", expenses)
  // 2. Process all expenses
  expenses.forEach((expense) => {
    const expAmount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;
    console.log("#### expAmount", expAmount)
    totalExpenseAmount += expAmount;
    const payerId = String(expense.paidBy || expense.paid_by || '');

    if (totalPaidMap[payerId] !== undefined) {
      totalPaidMap[payerId] += expAmount;
    } else {
      totalPaidMap[payerId] = expAmount;
    }

    const participants = (expense.participants && expense.participants.length > 0)
      ? expense.participants
      : Array.isArray(expense.splits)
      ? expense.splits.map((s: any) => ({
          userId: String(s.member_id ?? s.userId ?? ''),
          amount: typeof s.amount === 'number' ? s.amount : parseFloat(s.amount) || 0,
        }))
      : [];

    // Process participant shares
    participants.forEach((p) => {
      const pUserId = String(p.userId);
      const pAmount = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0;
      if (totalShareMap[pUserId] !== undefined) {
        totalShareMap[pUserId] += pAmount;
      } else {
        totalShareMap[pUserId] = pAmount;
      }

      // If participant is different from payer, participant owes payer
      if (payerId && pUserId !== payerId) {
        if (!pairwise[payerId]) pairwise[payerId] = {};
        if (!pairwise[pUserId]) pairwise[pUserId] = {};

        pairwise[payerId][pUserId] = (pairwise[payerId][pUserId] || 0) + pAmount;
      }
    });
  });

  // 3. Process all settlements
  settlements.forEach((settlement) => {
    const fromUserId = String(settlement.fromUserId);
    const toUserId = String(settlement.toUserId);
    const amount = typeof settlement.amount === 'number' ? settlement.amount : parseFloat(settlement.amount) || 0;
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
    const mId = String(m.id);
    const paid = totalPaidMap[mId] || 0;
    const share = totalShareMap[mId] || 0;
    const settledPaid = settlementsPaidMap[mId] || 0;
    const settledRecv = settlementsReceivedMap[mId] || 0;

    const net = (paid - share) + (settledRecv - settledPaid);
    netBalances[mId] = Number(net.toFixed(2));
  });

  // 5. Build MemberBalanceInfo list relative to current user
  const memberBalances: MemberBalanceInfo[] = members
    .filter((m) => String(m.id) !== effectiveCurrentUserId)
    .map((m) => {
      const mId = String(m.id);
      // Direct balance between current user and this member:
      // What member owes current user minus what current user owes member
      const memberOwesMe = pairwise[effectiveCurrentUserId]?.[mId] || 0;
      const meOwesMember = pairwise[mId]?.[effectiveCurrentUserId] || 0;
      const directNet = Number((memberOwesMe - meOwesMember).toFixed(2));

      return {
        member: m,
        netBalance: netBalances[mId] || 0,
        userOwedAmount: directNet,
        totalPaid: totalPaidMap[mId] || 0,
        totalShare: totalShareMap[mId] || 0,
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
