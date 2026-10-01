export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface GroupMember {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  initials: string;
  color?: string;
  isCurrentUser?: boolean;
  isAdmin?: boolean;
}

export interface ExpenseParticipant {
  userId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface GroupExpense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string; // member userId
  splitType: SplitType;
  participants: ExpenseParticipant[];
  category: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank transfer' | 'Other';

export interface GroupSettlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatarIcon: string;
  currency: string;
  createdBy: string;
  createdAt: string;
  members: GroupMember[];
  simplifyDebts?: boolean;
  defaultSplit?: SplitType;
}

export interface SimplifiedDebt {
  fromUserId: string;
  fromUserName: string;
  fromUserInitials?: string;
  toUserId: string;
  toUserName: string;
  toUserInitials?: string;
  amount: number;
}

export interface MemberBalanceInfo {
  member: GroupMember;
  netBalance: number; // positive = owed to user, negative = user owes
  userOwedAmount: number; // specific to current user: positive = member owes you, negative = you owe member
  totalPaid: number;
  totalShare: number;
}

export interface GroupBalanceCalculation {
  totalExpense: number;
  netBalances: Record<string, number>; // userId -> net balance (+ is owed, - owes)
  myNetBalance: number; // current user net balance
  memberBalances: MemberBalanceInfo[];
  pairwiseBalances: Record<string, Record<string, number>>; // fromUser -> toUser -> amount
  simplifiedDebts: SimplifiedDebt[];
}
