import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import AddExpenseScreen from '../screens/transactions/AddExpenseScreen';
import ExpenseDetailsScreen from '../screens/transactions/ExpenseDetailsScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { SCREEN_NAMES } from '../utils/screenNames';
import { ExpenseDashboard } from '../components';
import BankAccountScreen from '../screens/transactions/BankAccountScreen';
import GroupExpensesScreen from '../screens/GroupExpense/GroupExpensesScreen';
import CreateGroupScreen from '../screens/GroupExpense/CreateGroupScreen';
import GroupDetailsScreen from '../screens/GroupExpense/GroupDetailsScreen';
import AddGroupExpenseScreen from '../screens/GroupExpense/AddGroupExpenseScreen';
import GroupBalancesScreen from '../screens/GroupExpense/GroupBalancesScreen';
import GroupMembersScreen from '../screens/GroupExpense/GroupMembersScreen';
import GroupExpenseDetailsScreen from '../screens/GroupExpense/GroupExpenseDetailsScreen';
import SettleGroupScreen from '../screens/GroupExpense/SettleGroupScreen';
import GroupSettingsScreen from '../screens/GroupExpense/GroupSettingsScreen';
import { GroupMember } from '../types/groupExpense';
import NotificationScreen from '../screens/notifications/NotificationScreen';

export type AppStackParamList = {
  Home: undefined;
  Transactions: undefined;
  AddExpense: undefined;
  ExpenseDetails: {
    expenseId: string;
  };
  Analytics: undefined;
  Profile: undefined;
  BankAccountScreen: undefined;

  // Group Expense
  GroupExpenses: undefined;
  CreateGroup: undefined;
  GroupDetails: {
    groupId: string;
  };
  AddGroupExpense: {
    groupId: string;
  };
  GroupBalances: {
    groupId: string;
  };
  GroupMembers: {
    groupId: string;
  };
  GroupExpenseDetails: {
    groupId: string;
    expenseId: string;
  };
  SettleGroup: {
    groupId: string;
    fromUserId?: string;
    toUserId?: string;
    suggestedAmount?: number;
    targetMember?: GroupMember;
    direction?: 'theyOweYou' | 'youOweThem';
  };
  GroupSettings: {
    groupId: string;
  };
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={SCREEN_NAMES.HOME}  
      screenOptions={{
        headerShown: false,
      }}>
      
      <Stack.Screen
        name={SCREEN_NAMES.HOME}
        component={ExpenseDashboard}
      />

      <Stack.Screen
        name={SCREEN_NAMES.TRANSACTIONS}
        component={TransactionsScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.ADD_EXPENSE}
        component={AddExpenseScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.EXPENSE_DETAILS}
        component={ExpenseDetailsScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.ANALYTICS}
        component={AnalyticsScreen}
      />

      <Stack.Screen
        name= {SCREEN_NAMES.PROFILE}
        component={ProfileScreen}
      />

      <Stack.Screen
        name= {SCREEN_NAMES.BANK_ACCOUNT_SCREEN}
        component={BankAccountScreen}
      />

      {/* Group Expense Screens */}
      <Stack.Screen
        name={SCREEN_NAMES.GROUP_EXPENSES}
        component={GroupExpensesScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.CREATE_GROUP}
        component={CreateGroupScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.GROUP_DETAILS}
        component={GroupDetailsScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.ADD_GROUP_EXPENSE}
        component={AddGroupExpenseScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.GROUP_BALANCES}
        component={GroupBalancesScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.GROUP_MEMBERS}
        component={GroupMembersScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.GROUP_EXPENSE_DETAILS}
        component={GroupExpenseDetailsScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.SETTLE_GROUP}
        component={SettleGroupScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.GROUP_SETTINGS}
        component={GroupSettingsScreen}
      />

      <Stack.Screen
        name={SCREEN_NAMES.NOTIFICATIONS}
        component={NotificationScreen}
      />

    </Stack.Navigator>
  );
};

export default AppNavigator;