import { ExpenseParticipant, SplitType } from '../../types/groupExpense';

export interface SplitValidationResult {
  isValid: boolean;
  errorMessage?: string;
  difference?: number;
  totalComputed?: number;
}

export const validateSplit = (
  splitType: SplitType,
  totalAmount: number,
  participants: ExpenseParticipant[]
): SplitValidationResult => {
  if (!participants || participants.length === 0) {
    return {
      isValid: false,
      errorMessage: 'At least one participant must be selected',
    };
  }

  if (totalAmount <= 0) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid expense amount',
    };
  }

  if (splitType === 'equal') {
    return { isValid: true };
  }

  if (splitType === 'exact') {
    const sum = participants.reduce((acc, p) => acc + (p.amount || 0), 0);
    const diff = Number((totalAmount - sum).toFixed(2));
    if (Math.abs(diff) > 0.05) {
      return {
        isValid: false,
        errorMessage: diff > 0 ? `Remaining ₹${diff}` : `Exceeds total by ₹${Math.abs(diff)}`,
        difference: diff,
        totalComputed: sum,
      };
    }
    return { isValid: true, totalComputed: sum };
  }

  if (splitType === 'percentage') {
    const sumPct = participants.reduce((acc, p) => acc + (p.percentage || 0), 0);
    const diffPct = Number((100 - sumPct).toFixed(2));
    if (Math.abs(diffPct) > 0.05) {
      return {
        isValid: false,
        errorMessage: diffPct > 0 ? `Remaining ${diffPct}%` : `Exceeds 100% by ${Math.abs(diffPct)}%`,
        difference: diffPct,
        totalComputed: sumPct,
      };
    }
    return { isValid: true, totalComputed: sumPct };
  }

  if (splitType === 'shares') {
    const totalShares = participants.reduce((acc, p) => acc + (p.shares || 0), 0);
    if (totalShares <= 0) {
      return {
        isValid: false,
        errorMessage: 'Total shares must be greater than 0',
      };
    }
    return { isValid: true };
  }

  return { isValid: true };
};
