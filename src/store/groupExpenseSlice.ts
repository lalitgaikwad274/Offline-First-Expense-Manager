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
  groups: [],
  expenses: [],
  settlements: [],
  currentUser: {} as GroupMember,
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
      const idx = state.groups.findIndex((g) => String(g.id) === String(action.payload.id));
      if (idx !== -1) {
        state.groups[idx] = action.payload;
      } else {
        state.groups.unshift(action.payload);
      }
    },
    updateGroup: (state, action: PayloadAction<Group>) => {
      const idx = state.groups.findIndex((g) => String(g.id) === String(action.payload.id));
      if (idx !== -1) {
        state.groups[idx] = action.payload;
      } else {
        state.groups.unshift(action.payload);
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
    setGroups: (state, action: PayloadAction<any>) => {
      const rawList = Array.isArray(action.payload)
        ? action.payload
        : Array.isArray(action.payload?.groups)
        ? action.payload.groups
        : Array.isArray(action.payload?.data)
        ? action.payload.data
        : null;

      if (rawList) {
        const seen = new Set<string>();
        const uniqueGroups: Group[] = [];
        for (const g of rawList) {
          if (!g) continue;
          const idStr = String(g.id);
          if (!seen.has(idStr)) {
            seen.add(idStr);
            uniqueGroups.push(g);
          }
        }
        state.groups = uniqueGroups;
      } else if (action.payload && typeof action.payload === 'object' && action.payload.id) {
        const singleGroup = action.payload as Group;
        const exists = state.groups.findIndex((g) => String(g.id) === String(singleGroup.id));
        if (exists >= 0) {
          state.groups[exists] = singleGroup;
        } else {
          state.groups.unshift(singleGroup);
        }
      }
    },
    setGroupExpenses: (state, action: PayloadAction<GroupExpense[]>) => {
      const newExpenses = Array.isArray(action.payload) ? action.payload : [];
      if (newExpenses.length === 0) return;
      const targetGroupId = newExpenses[0]?.groupId;
      if (targetGroupId) {
        state.expenses = [
          ...newExpenses,
          ...state.expenses.filter((e) => String(e.groupId) !== String(targetGroupId)),
        ];
      } else {
        state.expenses = newExpenses;
      }
    },
    setSettlements: (state, action: PayloadAction<GroupSettlement[]>) => {
      state.settlements = Array.isArray(action.payload) ? action.payload : [];
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
export const getGroups = (state: RootState) =>
  Array.isArray(state.groupExpense?.groups) ? state.groupExpense.groups : [];

export const getGroupById = (groupId: string | undefined | null) => (state: RootState) => {
  const groups = state.groupExpense?.groups;
  if (!Array.isArray(groups) || !groupId) return undefined;
  return groups.find((g) => g && (g.id === groupId || String(g.id) === String(groupId)));
};

export const getGroupExpenses = (groupId: string | undefined | null) => (state: RootState) => {
  const expenses = state.groupExpense?.expenses;
  console.log("##### expenses", expenses, groupId);
  if (!Array.isArray(expenses) || !groupId) return [];
  return expenses.filter(
    (e) =>
      e &&
      (String(e.groupId) === String(groupId) ||
        String(e.group_id) === String(groupId))
  );
};

export const getGroupExpenseById = (expenseId: string | undefined | null) => (state: RootState) => {
  const expenses = state.groupExpense?.expenses;
  if (!Array.isArray(expenses) || !expenseId) return undefined;
  return expenses.find((e) => e && (e.id === expenseId || String(e.id) === String(expenseId)));
};

export const getGroupMembers = (groupId: string | undefined | null) => (state: RootState) => {
  const groups = state.groupExpense?.groups;
  if (!Array.isArray(groups) || !groupId) return [];
  const group = groups.find((g) => g && (g.id === groupId || String(g.id) === String(groupId)));
  return Array.isArray(group?.members) ? group.members : [];
};

export const getGroupSettlements = (groupId: string | undefined | null) => (state: RootState) => {
  const settlements = state.groupExpense?.settlements;
  if (!Array.isArray(settlements) || !groupId) return [];
  return settlements.filter((s) => s && (s.groupId === groupId || String(s.groupId) === String(groupId)));
};

export const getGroupBalances = (groupId: string | undefined | null) => (state: RootState): GroupBalanceCalculation => {
  const emptyResult: GroupBalanceCalculation = {
    totalExpense: 0,
    netBalances: {},
    myNetBalance: 0,
    memberBalances: [],
    pairwiseBalances: {},
    simplifiedDebts: [],
  };
  const groups = state.groupExpense?.groups;
  if (!Array.isArray(groups) || !groupId) return emptyResult;
  const group = groups.find((g) => g && (g.id === groupId || String(g.id) === String(groupId)));
  if (!group) return emptyResult;

  const expenses = Array.isArray(state.groupExpense?.expenses)
    ? state.groupExpense.expenses.filter((e) => e && (e.groupId === groupId || String(e.groupId) === String(groupId)))
    : [];
  const settlements = Array.isArray(state.groupExpense?.settlements)
    ? state.groupExpense.settlements.filter((s) => s && (s.groupId === groupId || String(s.groupId) === String(groupId)))
    : [];
  const currentUserId = state.groupExpense?.currentUser?.id || '';

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
