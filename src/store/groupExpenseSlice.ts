import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Group,
  GroupExpense,
  GroupMember,
  GroupSettlement,
  GroupBalanceCalculation,
} from '../types/groupExpense';
import {
  CURRENT_USER,
  INITIAL_EXPENSES,
  INITIAL_GROUPS,
  INITIAL_SETTLEMENTS,
} from '../utils/groupExpense/mockData';
import { calculateBalances } from '../utils/groupExpense/calculateBalances';
import { RootState } from './index';

export interface GroupExpenseState {
  groups: Group[];
  expenses: GroupExpense[];
  settlements: GroupSettlement[];
  currentUser: GroupMember;
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupExpenseState = {
  groups: INITIAL_GROUPS,
  expenses: INITIAL_EXPENSES,
  settlements: INITIAL_SETTLEMENTS,
  currentUser: CURRENT_USER,
  isLoading: false,
  error: null,
};

export const groupExpenseSlice = createSlice({
  name: 'groupExpense',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<Partial<GroupMember>>) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },

    // Groups
    createGroup: (state, action: PayloadAction<Group>) => {
      state.groups.unshift(action.payload);
    },
    updateGroup: (state, action: PayloadAction<Group>) => {
      const idx = state.groups.findIndex((g) => g.id === action.payload.id);
      if (idx !== -1) {
        state.groups[idx] = action.payload;
      }
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
      state.expenses = state.expenses.filter((e) => e.groupId !== action.payload);
      state.settlements = state.settlements.filter((s) => s.groupId !== action.payload);
    },

    // Group Members
    addGroupMember: (
      state,
      action: PayloadAction<{ groupId: string; member: GroupMember }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        const exists = group.members.some((m) => m.id === action.payload.member.id);
        if (!exists) {
          group.members.push(action.payload.member);
        }
      }
    },
    removeGroupMember: (
      state,
      action: PayloadAction<{ groupId: string; memberId: string }>
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        group.members = group.members.filter((m) => m.id !== action.payload.memberId);
      }
    },

    // Expenses
    addGroupExpense: (state, action: PayloadAction<GroupExpense>) => {
      state.expenses.unshift(action.payload);
    },
    updateGroupExpense: (state, action: PayloadAction<GroupExpense>) => {
      const idx = state.expenses.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) {
        state.expenses[idx] = action.payload;
      }
    },
    deleteGroupExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
    },

    // Settlements
    addSettlement: (state, action: PayloadAction<GroupSettlement>) => {
      state.settlements.unshift(action.payload);
    },
    deleteSettlement: (state, action: PayloadAction<string>) => {
      state.settlements = state.settlements.filter((s) => s.id !== action.payload);
    },

    // Batch sets
    setGroups: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
    },
    setGroupExpenses: (state, action: PayloadAction<GroupExpense[]>) => {
      state.expenses = action.payload;
    },
    setSettlements: (state, action: PayloadAction<GroupSettlement[]>) => {
      state.settlements = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setCurrentUser,
  createGroup,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  addGroupExpense,
  updateGroupExpense,
  deleteGroupExpense,
  addSettlement,
  deleteSettlement,
  setGroups,
  setGroupExpenses,
  setSettlements,
} = groupExpenseSlice.actions;

// Selectors
export const getGroups = (state: RootState) => state.groupExpense.groups;
export const getGroupById = (groupId: string) => (state: RootState) =>
  state.groupExpense.groups.find((g) => g.id === groupId);
export const getGroupExpenses = (groupId: string) => (state: RootState) =>
  state.groupExpense.expenses.filter((e) => e.groupId === groupId);
export const getGroupExpenseById = (expenseId: string) => (state: RootState) =>
  state.groupExpense.expenses.find((e) => e.id === expenseId);
export const getGroupMembers = (groupId: string) => (state: RootState) => {
  const group = state.groupExpense.groups.find((g) => g.id === groupId);
  return group ? group.members : [];
};
export const getGroupSettlements = (groupId: string) => (state: RootState) =>
  state.groupExpense.settlements.filter((s) => s.groupId === groupId);

export const getGroupBalances = (groupId: string) => (state: RootState): GroupBalanceCalculation => {
  const group = state.groupExpense.groups.find((g) => g.id === groupId);
  if (!group) {
    return {
      totalExpense: 0,
      netBalances: {},
      myNetBalance: 0,
      memberBalances: [],
      pairwiseBalances: {},
      simplifiedDebts: [],
    };
  }
  const expenses = state.groupExpense.expenses.filter((e) => e.groupId === groupId);
  const settlements = state.groupExpense.settlements.filter((s) => s.groupId === groupId);
  const currentUserId = state.groupExpense.currentUser.id;

  return calculateBalances(group, expenses, settlements, currentUserId);
};

export const getMyOverallGroupBalance = (state: RootState) => {
  let totalYouAreOwed = 0;
  let totalYouOwe = 0;

  state.groupExpense.groups.forEach((group) => {
    const expenses = state.groupExpense.expenses.filter((e) => e.groupId === group.id);
    const settlements = state.groupExpense.settlements.filter((s) => s.groupId === group.id);
    const currentUserId = state.groupExpense.currentUser.id;
    const balanceInfo = calculateBalances(group, expenses, settlements, currentUserId);

    if (balanceInfo.myNetBalance > 0) {
      totalYouAreOwed += balanceInfo.myNetBalance;
    } else if (balanceInfo.myNetBalance < 0) {
      totalYouOwe += Math.abs(balanceInfo.myNetBalance);
    }
  });

  return {
    totalYouAreOwed: Number(totalYouAreOwed.toFixed(2)),
    totalYouOwe: Number(totalYouOwe.toFixed(2)),
    netOverall: Number((totalYouAreOwed - totalYouOwe).toFixed(2)),
  };
};

export default groupExpenseSlice.reducer;
