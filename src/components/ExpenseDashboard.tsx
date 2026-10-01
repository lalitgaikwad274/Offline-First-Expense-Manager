import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart3, Grid2x2, Plus, Receipt, Users } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { setActiveTab, setSelectedPeriod, setUserDetail, toggleOffline } from '../store/expenseSlice';
import { Expense } from '../types/expense';
import { COLORS, SPACING, TYPOGRAPHY, moderateScale } from '../utils/constants';
// Modular Components
import Header from './Header';
import SummaryCard from './SummaryCard';
import CategoryItem from './CategoryItem';
import ExpenseCard from './ExpenseCard';
import BottomNavigation from './BottomNavigation';
import { getAuth } from '@react-native-firebase/auth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SCREEN_NAMES } from '../utils/screenNames';
import { getBankDetails, getTransactions } from '../store/api';
import NoBankAccountCard from './NoBankAccountCard';
import SpendingOverviewCard from './SpendingOverviewCard';
import {
  SummaryCardSkeleton,
  SpendingOverviewSkeleton,
  RecentExpensesSkeleton,
} from './Shimmer';

const QUICK_ACTIONS = [
  {
    id: 'add',
    title: 'Add expense',
    icon: Plus,
    isPrimary: true,
  },
  {
    id: 'transactions',
    title: 'Passbook',
    icon: Receipt,
  },
  {
    id: 'groupExpense',
    title: 'Group expense',
    icon: Users,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
  },
  {
    id: 'categories',
    title: 'Categories',
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

  useEffect(()=>{
      const auth = getAuth();
      const currentUser = auth.currentUser;
      dispatch(setUserDetail({
        id: currentUser?.uid || "",
        name: currentUser?.displayName || "",
        initials: (currentUser?.displayName || "").trim()[0]?.toUpperCase() || "",
        notificationCount: 0,
      }))
  }, [])

  const navigation = useNavigation<any>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveTab('home'));
    }, [dispatch])
  );

  const reduxIsLoading = useAppSelector(state => state.expense.isLoading);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setIsDataLoading(true);
        await Promise.allSettled([
          dispatch(getTransactions()),
          dispatch(getBankDetails()),
        ]);
      } catch (err) {
        console.log('Error fetching dashboard data:', err);
      } finally {
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const isLoading = isDataLoading || reduxIsLoading;

  // const handleLogoutRequest = useCallback(() => {
  //   setIsDrawerOpen(false);
  //   setTimeout(() => {
  //     Alert.alert(
  //       'Log Out',
  //       'Are you sure you want to log out of Expensio?',
  //       [
  //         { text: 'Cancel', style: 'cancel' },
  //         {
  //           text: 'Log Out',
  //           style: 'destructive',
  //           onPress: async () => {
  //             try {
  //               const auth = getAuth();
  //               await signOut(auth);
  //             } catch (error: any) {
  //               Alert.alert('Error', error?.message || 'Failed to log out');
  //             }
  //           },
  //         },
  //       ]
  //     );
  //   }, Platform.OS === 'android' ? 200 : 50);
  // }, []);

  // Compute financial metrics via Redux state
  const totalExpenses = useMemo(() => {
    return Math.max(0, expenses.reduce((sum, item) => sum + (item.category === 'Credit' ? -item.amount : item.amount), 0));
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

        case 'groupExpense':
          navigation.navigate(SCREEN_NAMES.GROUP_EXPENSES);
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

  // const handleToggleOffline = useCallback(() => {
  //   dispatch(toggleOffline());
  //   Alert.alert(
  //     'Network Mode Toggled',
  //     isOffline
  //       ? 'Status: Online. Background sync engine running.'
  //       : 'Status: Offline mode enabled. Transactions saved locally in SQLite.'
  //   );
  // }, [dispatch, isOffline]);

  const handleTabPress = useCallback(
    (tabId: string) => {
      dispatch(setActiveTab(tabId));
      switch (tabId) {
        case 'home':
          break;
        case 'transactions':
          navigation.navigate(SCREEN_NAMES.TRANSACTIONS);
          break;
        case 'add':
          navigation.navigate(SCREEN_NAMES.ADD_EXPENSE);
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

  const handleExpensePress = useCallback(
    (item: Expense) => {
      navigation.navigate(SCREEN_NAMES.EXPENSE_DETAILS, {
        expenseId: item.id,
      });
    },
    [navigation]
  );
  console.log("user", user)

  const navTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollOffset = useRef(0);
  const isHidden = useRef(false);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const diff = currentOffset - lastScrollOffset.current;

      // When at the very top of dashboard, always restore navigation
      if (currentOffset <= 20) {
        if (isHidden.current) {
          isHidden.current = false;
          Animated.spring(navTranslateY, {
            toValue: 0,
            friction: 8,
            tension: 50,
            useNativeDriver: true,
          }).start();
        }
      } else if (diff > 12 && currentOffset > 60) {
        // Scrolling down -> smoothly slide down to hide
        if (!isHidden.current) {
          isHidden.current = true;
          Animated.timing(navTranslateY, {
            toValue: 130,
            duration: 220,
            useNativeDriver: true,
          }).start();
        }
      } else if (diff < -12) {
        // Scrolling up -> smoothly slide back up
        if (isHidden.current) {
          isHidden.current = false;
          Animated.spring(navTranslateY, {
            toValue: 0,
            friction: 8,
            tension: 50,
            useNativeDriver: true,
          }).start();
        }
      }

      lastScrollOffset.current = currentOffset;
    },
    [navTranslateY]
  );

  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  // Limit recent expenses to last 5
  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 5);
  }, [expenses]);

  return (
    <View style={[styles.safeArea, { paddingTop: topInset }]}>
      <StatusBar barStyle="dark-content" />


      <View style={styles.container}>
        <FlatList
          data={[]}
          renderItem={() => null}
          keyExtractor={() => 'dashboard-content'}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: moderateScale(100) },
          ]}
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

              {/* Expense Gradient Summary Card or Shimmer Skeleton */}
              {isLoading ? (
                <SummaryCardSkeleton />
              ) : income > 0 ? (
                <SummaryCard
                  totalAmount={totalExpenses}
                  incomeAmount={income}
                  balanceAmount={balance}
                  selectedPeriod={selectedPeriod}
                  trendPercentage={12}
                  onPeriodPress={handlePeriodChange}
                />
              ) : (
                <NoBankAccountCard
                  onAddAccount={() =>
                    navigation.navigate(SCREEN_NAMES.BANK_ACCOUNT_SCREEN)
                  }
                />
              )}

              {/* Quick Actions Grid / Horizontal Scroll */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickActionsScroll}
                  style={styles.quickActionsContainer}
                >
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
                </ScrollView>
              </View>

              {/* Spending Overview Section */}
              <SpendingOverviewCard isLoading={isLoading} />

              {/* Recent Transactions Unified Card Section */}
              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <Text style={styles.sectionTitle}>Recent Expenses</Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() => navigation.navigate(SCREEN_NAMES.TRANSACTIONS)}
                  >
                    <Text style={styles.seeAll}>See All</Text>
                  </Pressable>
                </View>

                {isLoading ? (
                  <RecentExpensesSkeleton />
                ) : (
                  <View style={styles.recentUnifiedCard}>
                    {recentExpenses.length === 0 ? (
                      <View style={styles.emptyRecent}>
                        <Receipt
                          size={moderateScale(32)}
                          color={COLORS.gray}
                          strokeWidth={1.8}
                        />
                        <Text style={styles.emptyRecentText}>
                          No recent transactions recorded
                        </Text>
                      </View>
                    ) : (
                      recentExpenses.map((item, index) => (
                        <ExpenseCard
                          key={item.id}
                          item={item}
                          variant="row"
                          isLast={index === recentExpenses.length - 1}
                          onPress={handleExpensePress}
                        />
                      ))
                    )}
                  </View>
                )}
              </View>
            </>
          }
        />

        {/* Floating Animated Bottom Navigation */}
        <BottomNavigation
          activeTab="home"
          onTabPress={handleTabPress}
          // translateY={navTranslateY} // for smooth slide up-down animation
          floating
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: SPACING.screenPaddingVertical,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.navy,
  },
  quickActionsContainer: {
    marginHorizontal: -SPACING.screenPaddingHorizontal,
    marginTop: moderateScale(14),
  },
  quickActionsScroll: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    gap: moderateScale(12),
    alignItems: 'flex-start',
  },
  recentSection: {
    marginTop: moderateScale(14)
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  seeAll: {
    color: COLORS.expense,
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  recentUnifiedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyRecent: {
    paddingVertical: moderateScale(32),
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  emptyRecentText: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontWeight: '600',
  },
});

export default ExpenseDashboard;