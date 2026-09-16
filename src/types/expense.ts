export type ExpenseCategory =
  | 'Food & Dining'
  | 'Transport'
  | 'Shopping'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health'
  | 'Travel'
  | 'Other';

export interface Expense {
  id: string;
  title?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
  iconName?: string;
  color?: string;
  synced?: boolean;
}

export interface QuickActionItemData {
  id: string;
  title: string;
  iconName: string;
  color?: string;
  background?: string;
  isPrimary?: boolean;
}

export interface BottomTabItemData {
  id: string;
  title: string;
  iconName: string;
}

export interface FinancialSummary {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  trendPercentage: number;
  selectedPeriod: string;
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  email?: string;
  avatarUrl?: string;
  notificationCount: number;
}
