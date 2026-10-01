import { ExpenseParticipant } from '../../types/groupExpense';

/**
 * Calculates equal split across participants ensuring exact sum equals total amount.
 * Avoids floating point penny discrepancy by distributing any remaining cents/cents to the first members.
 */
export const calculateEqualSplit = (
  totalAmount: number,
  participantUserIds: string[]
): ExpenseParticipant[] => {
  if (!participantUserIds || participantUserIds.length === 0) {
    return [];
  }

  const count = participantUserIds.length;
  // Use integer cents / paisa calculation to prevent floating point error
  const totalInPaisa = Math.round(totalAmount * 100);
  const basePaisa = Math.floor(totalInPaisa / count);
  let remainderPaisa = totalInPaisa % count;

  return participantUserIds.map((userId) => {
    let memberPaisa = basePaisa;
    if (remainderPaisa > 0) {
      memberPaisa += 1;
      remainderPaisa -= 1;
    }
    const amount = Number((memberPaisa / 100).toFixed(2));
    return {
      userId,
      amount,
    };
  });
};
