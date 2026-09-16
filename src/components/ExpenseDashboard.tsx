import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BarChart3, Grid2x2, Plus, Receipt } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { addExpense, setActiveTab, setSelectedPeriod, toggleOffline } from '../store/expenseSlice';
import { Expense } from '../types/expense';
import { COLORS, SPACING, TYPOGRAPHY, moderateScale } from '../utils/constants';
// Modular Components
import Header from './Header';
import DrawerNavigation from './DrawerNavigation';
import OfflineBanner from './OfflineBanner';
import SummaryCard from './SummaryCard';
import FinancialCard from './FinancialCard';
import CategoryItem from './CategoryItem';
import ExpenseCard from './ExpenseCard';
import BottomNavigation from './BottomNavigation';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SCREEN_NAMES } from '../utils/screenNames';

const QUICK_ACTIONS = [
  {
    id: 'add',
    title: 'Add\nExpense',
    icon: Plus,
    isPrimary: true,
  },
  {
    id: 'transactions',
    title: 'View\nTransactions',
    icon: Receipt,
  },
  {
    id: 'analytics',
    title: 'Analytics\nStats',
    icon: BarChart3,
  },
  {
    id: 'categories',
    title: 'Browse\nCategories',
    icon: Grid2x2,
  },
];

export const ExpenseDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    expenses,
    income,
    isOffline,
    selectedPeriod,
    activeTab,
    user,
  } = useAppSelector(state => state.expense);

  const navigation = useNavigation<any>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveTab('home'));
    }, [dispatch])
  );

  const handleLogoutRequest = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out of Expensio?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: async () => {
              try {
                const auth = getAuth();
                await signOut(auth);
              } catch (error: any) {
                Alert.alert('Error', error?.message || 'Failed to log out');
              }
            },
          },
        ]
      );
    }, Platform.OS === 'android' ? 200 : 50);
  }, []);

  // Compute financial metrics via Redux state
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const balance = useMemo(() => {
    return income - totalExpenses;
  }, [income, totalExpenses]);

  // Handlers
  const handleQuickAction = useCallback(
    (actionId: string) => {
      switch (actionId) {
        case 'add':
          navigation.navigate(SCREEN_NAMES.ADD_EXPENSE);
          break;

        case 'transactions':
          navigation.navigate(SCREEN_NAMES.TRANSACTIONS);
          break;

        case 'analytics':
          navigation.navigate(SCREEN_NAMES.ANALYTICS);
          break;

        case 'categories':
          Alert.alert(
            'Categories',
            'Categories: Food & Dining, Transport, Shopping, Bills & Utilities, Health, Travel, Entertainment'
          );
          break;

        default:
          break;
      }
    },
    [navigation]
  );

  const handlePeriodChange = useCallback(() => {
    const periods = ['This Month', 'Last Month', 'This Quarter', 'This Year'];
    const nextIndex =
      (periods.indexOf(selectedPeriod) + 1) % periods.length;
    dispatch(setSelectedPeriod(periods[nextIndex]));
  }, [dispatch, selectedPeriod]);

  const handleToggleOffline = useCallback(() => {
    dispatch(toggleOffline());
    Alert.alert(
      'Network Mode Toggled',
      isOffline
        ? 'Status: Online. Background sync engine running.'
        : 'Status: Offline mode enabled. Transactions saved locally in SQLite.'
    );
  }, [dispatch, isOffline]);

  const handleTabPress = useCallback(
    (tabId: string) => {
      dispatch(setActiveTab(tabId));
      switch (tabId) {
        case 'home':
          break;
        case 'transactions':
          navigation.navigate(SCREEN_NAMES.TRANSACTIONS);
          break;
        case 'analytics':
          navigation.navigate(SCREEN_NAMES.ANALYTICS);
          break;
        case 'profile':
          navigation.navigate(SCREEN_NAMES.PROFILE);
          break;
      }
    },
    [dispatch, navigation]
  );

  const handleDrawerSelect = useCallback(
    (itemId: string) => {
      switch (itemId) {
        case 'home':
          dispatch(setActiveTab('home'));
          break;
        case 'transactions':
          navigation.navigate(SCREEN_NAMES.TRANSACTIONS);
          break;
        case 'analytics':
          navigation.navigate(SCREEN_NAMES.ANALYTICS);
          break;
        case 'settings':
          navigation.navigate(SCREEN_NAMES.PROFILE);
          break;
        case 'cards':
          navigation.navigate(SCREEN_NAMES.TRANSACTIONS);
          break;
        case 'database':
          Alert.alert(
            'Offline SQLite Database',
            `Active Records: ${expenses.length}\nSync Engine: Active\nPending Syncs: ${
              expenses.filter(e => !e.synced).length
            }`
          );
          break;
        case 'security':
          Alert.alert('Security & Backup', 'AES-256 local encryption enabled.');
          break;
        default:
          dispatch(setActiveTab(itemId));
          break;
      }
    },
    [dispatch, navigation, expenses]
  );

  const handleExpensePress = useCallback(
    (item: Expense) => {
      navigation.navigate(SCREEN_NAMES.EXPENSE_DETAILS, {
        expenseId: item.id,
      });
    },
    [navigation]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Drawer Navigation */}
      <DrawerNavigation
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeItem={activeTab}
        onSelectItem={handleDrawerSelect}
        user={user}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        totalExpensesCount={expenses.length}
        onLogout={handleLogoutRequest}
      />

      <View style={styles.container}>
        <FlatList
          data={expenses}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          ListHeaderComponent={
            <>
              {/* Header with Top-Left Drawer Button & Clickable Logo */}
              <Header
                userName={user.name}
                userInitials={user.initials}
                notificationCount={user.notificationCount}
                onOpenDrawer={() => setIsDrawerOpen(true)}
                onNotificationPress={() =>
                  Alert.alert('Notifications', 'You have 1 pending transaction to sync.')
                }
                onProfilePress={() => dispatch(setActiveTab('profile'))}
              />

              {/* Offline Notice Banner */}
              {isOffline && (
                <OfflineBanner
                  onPress={handleToggleOffline}
                  title="You are offline"
                  subtitle="Your data will sync automatically when you're back online. Tap to toggle."
                />
              )}

              {/* Expense Gradient Summary Card */}
              <SummaryCard
                totalAmount={totalExpenses}
                selectedPeriod={selectedPeriod}
                trendPercentage={12}
                onPeriodPress={handlePeriodChange}
              />

              {/* Financial Metrics (Income & Balance) */}
              <View style={styles.financialRow}>
                <FinancialCard type="income" amount={income} />
                <FinancialCard type="balance" amount={balance} />
              </View>

              {/* Quick Actions Grid */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                  {QUICK_ACTIONS.map(item => (
                    <CategoryItem
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      icon={item.icon}
                      isPrimary={item.isPrimary}
                      onPress={handleQuickAction}
                    />
                  ))}
                </View>
              </View>

              {/* Recent Transactions List Header */}
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Recent Expenses</Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => navigation.navigate(SCREEN_NAMES.TRANSACTIONS)}
                >
                  <Text style={styles.seeAll}>See All</Text>
                </Pressable>
              </View>
            </>
          }
          renderItem={({ item, index }) => (
            <ExpenseCard
              item={item}
              isLast={index === expenses.length - 1}
              onPress={handleExpensePress}
            />
          )}
          ListFooterComponent={<View style={styles.footerSpace} />}
        />

        {/* Reusable Bottom Navigation */}
        <BottomNavigation
          activeTab="home"
          onTabPress={handleTabPress}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: SPACING.screenPaddingVertical,
  },
  financialRow: {
    flexDirection: 'row',
    gap: SPACING.gapMedium,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.navy,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: moderateScale(14),
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  seeAll: {
    color: COLORS.expense,
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  footerSpace: {
    height: moderateScale(30),
  },
});

export default ExpenseDashboard;