import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import AddExpenseScreen from '../screens/transactions/AddExpenseScreen';
import ExpenseDetailsScreen from '../screens/transactions/ExpenseDetailsScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { SCREEN_NAMES } from '../utils/screenNames';
import { ExpenseDashboard } from '../components';

export type AppStackParamList = {
  Home: undefined;
  Transactions: undefined;
  AddExpense: undefined;
  ExpenseDetails: {
    expenseId: string;
  };
  Analytics: undefined;
  Profile: undefined;
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

    </Stack.Navigator>
  );
};

export default AppNavigator;