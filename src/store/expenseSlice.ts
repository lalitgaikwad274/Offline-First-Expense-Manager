import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Expense, UserProfile } from '../types/expense';
import { COLORS } from '../utils/colors';

export interface ExpenseState {
  expenses: Expense[];
  income: number;
  selectedPeriod: string;
  isOffline: boolean;
  activeTab: string;
  user: UserProfile;
}

const initialExpenses: Expense[] = [
  {
    id: '1',
    category: 'Food & Dining',
    amount: 320,
    date: 'Today, 10:30 AM',
    color: COLORS.expense,
    synced: true,
  },
  {
    id: '2',
    category: 'Transport',
    amount: 150,
    date: 'Yesterday, 09:15 AM',
    color: COLORS.info,
    synced: true,
  },
  {
    id: '3',
    category: 'Shopping',
    amount: 1200,
    date: '12 Sep, 04:45 PM',
    color: COLORS.warning,
    synced: false,
  },
];

const initialState: ExpenseState = {
  expenses: initialExpenses,
  income: 30000,
  selectedPeriod: 'This Month',
  isOffline: true, // Demo default showing offline capability
  activeTab: 'home',
  user: {},
};

export const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setUserDetail: (state, action: PayloadAction<UserProfile> ) => {
      state.user = action.payload
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(item => item.id !== action.payload);
    },
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
    },
    setIncome: (state, action: PayloadAction<number>) => {
      state.income = action.payload;
    },
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    toggleOffline: (state) => {
      state.isOffline = !state.isOffline;
    },
    setSelectedPeriod: (state, action: PayloadAction<string>) => {
      state.selectedPeriod = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    clearNotifications: (state) => {
      state.user.notificationCount = 0;
    },
  },
});

export const {
  setUserDetail,
  addExpense,
  deleteExpense,
  setExpenses,
  setIncome,
  setOffline,
  toggleOffline,
  setSelectedPeriod,
  setActiveTab,
  clearNotifications,
} = expenseSlice.actions;

export default expenseSlice.reducer;
