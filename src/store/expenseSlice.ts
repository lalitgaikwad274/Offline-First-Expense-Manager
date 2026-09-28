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

const initialExpenses: Expense[] = [];

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
      state.income = state.income + action.payload;
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
