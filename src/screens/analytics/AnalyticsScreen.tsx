import React, { useMemo } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  PieChart,
  TrendingDown,
  Wallet,
} from 'lucide-react-native';
import { useAppSelector } from '../../store';
import { COLORS, moderateScale, SHADOWS } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import BottomNavigation from '../../components/BottomNavigation';
import { ExpenseCategory } from '../../types/expense';

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#FF6B6B',
  Transport: '#339AF0',
  Shopping: '#FCC419',
  'Bills & Utilities': '#51CF66',
  Entertainment: '#845EF7',
  Health: '#F06595',
  Travel: '#20C997',
  Other: '#868E96',
};

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const expenses = useAppSelector(state => state.expense.expenses);
  const income = useAppSelector(state => state.expense.income);
  const selectedPeriod = useAppSelector(state => state.expense.selectedPeriod);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [expenses]);

  const balance = useMemo(() => {
    return Math.max(0, income - totalExpenses);
  }, [income, totalExpenses]);

  const spentPercentage = useMemo(() => {
    if (income <= 0) return 0;
    return Math.min(100, Math.round((totalExpenses / income) * 100));
  }, [income, totalExpenses]);

  // Group expenses by category
  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};

    expenses.forEach(expense => {
      const cat = expense.category || 'Other';
      if (!map[cat]) {
        map[cat] = { total: 0, count: 0 };
      }
      map[cat].total += expense.amount;
      map[cat].count += 1;
    });

    const list = Object.entries(map).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalExpenses > 0 ? Math.round((data.total / totalExpenses) * 100) : 0,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
    }));

    // Sort highest spending first
    return list.sort((a, b) => b.total - a.total);
  }, [expenses, totalExpenses]);

  const syncedCount = useMemo(() => expenses.filter(e => e.synced).length, [expenses]);
  const pendingCount = expenses.length - syncedCount;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate(SCREEN_NAMES.HOME)}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
        >
          <ArrowLeft size={moderateScale(20)} color={COLORS.navy} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>{selectedPeriod} Breakdown</Text>
        </View>

        <View style={styles.periodBadge}>
          <Text style={styles.periodBadgeText}>{selectedPeriod}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Metric Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroLabel}>Total Spending</Text>
              <Text style={styles.heroAmount}>₹{totalExpenses.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.heroIconCircle}>
              <PieChart size={moderateScale(26)} color={COLORS.petrol} strokeWidth={2.2} />
            </View>
          </View>

          {/* Spend progress relative to income */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressSubtitle}>Spent of Monthly Budget</Text>
              <Text style={styles.progressPercent}>{spentPercentage}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${spentPercentage}%` },
                  spentPercentage > 85 && { backgroundColor: COLORS.red },
                ]}
              />
            </View>
          </View>

          {/* Quick stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(51, 154, 240, 0.12)' }]}>
                <ArrowDownRight size={moderateScale(16)} color="#339AF0" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.statSmallLabel}>Income</Text>
                <Text style={styles.statValue}>₹{income.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(81, 207, 102, 0.14)' }]}>
                <Wallet size={moderateScale(16)} color="#40C057" strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.statSmallLabel}>Balance</Text>
                <Text style={styles.statValue}>₹{balance.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sync & Offline Status Card */}
        <View style={styles.syncCard}>
          <View style={styles.syncHeader}>
            <Text style={styles.sectionHeading}>Data Synchronization</Text>
            <Text style={styles.syncCount}>{expenses.length} Records</Text>
          </View>

          <View style={styles.syncRow}>
            <View style={styles.syncItem}>
              <CheckCircle2 size={moderateScale(18)} color="#40C057" strokeWidth={2.2} />
              <Text style={styles.syncText}>{syncedCount} Synced to Cloud</Text>
            </View>
            <View style={styles.syncItem}>
              <Clock size={moderateScale(18)} color={pendingCount > 0 ? '#FFA94D' : COLORS.gray} strokeWidth={2.2} />
              <Text style={[styles.syncText, pendingCount > 0 && { color: '#E8590C', fontWeight: '700' }]}>
                {pendingCount} Offline Pending
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionHeading}>Spending by Category</Text>

          {categoryStats.length === 0 ? (
            <View style={styles.emptyCategories}>
              <Text style={styles.emptyText}>No expenses recorded for this period.</Text>
            </View>
          ) : (
            categoryStats.map(item => (
              <View key={item.category} style={styles.categoryCard}>
                <View style={styles.categoryRow}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                    <View>
                      <Text style={styles.categoryName}>{item.category}</Text>
                      <Text style={styles.categoryTxCount}>
                        {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>
                      ₹{item.total.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
                  </View>
                </View>

                {/* Progress bar per category */}
                <View style={styles.catBarTrack}>
                  <View
                    style={[
                      styles.catBarFill,
                      {
                        width: `${Math.max(item.percentage, 4)}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation with Active Tab */}
      <BottomNavigation activeTab="analytics" />
    </SafeAreaView>
  );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: moderateScale(14),
  },
  headerTitle: {
    fontSize: moderateScale(19),
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontWeight: '500',
    marginTop: 2,
  },
  periodBadge: {
    backgroundColor: 'rgba(219, 245, 248, 0.9)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(14),
  },
  periodBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: COLORS.petrol,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(100),
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(18),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    marginBottom: moderateScale(14),
    ...SHADOWS.soft,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  heroLabel: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroAmount: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: COLORS.navy,
    marginTop: moderateScale(2),
  },
  heroIconCircle: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: 'rgba(219, 245, 248, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    marginBottom: moderateScale(16),
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(6),
  },
  progressSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.navy,
  },
  progressBarTrack: {
    height: moderateScale(8),
    backgroundColor: 'rgba(219, 237, 240, 0.6)',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.petrol,
    borderRadius: moderateScale(4),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(219, 237, 240, 0.6)',
    paddingTop: moderateScale(12),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  statDivider: {
    width: 1,
    height: moderateScale(28),
    backgroundColor: 'rgba(219, 237, 240, 0.8)',
  },
  statIconBadge: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statSmallLabel: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
    fontWeight: '500',
  },
  statValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
  },
  syncCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    marginBottom: moderateScale(14),
    ...SHADOWS.soft,
  },
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  syncCount: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.petrol,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: moderateScale(8),
  },
  syncItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  syncText: {
    fontSize: moderateScale(12),
    color: COLORS.navy,
    fontWeight: '500',
  },
  categorySection: {
    marginTop: moderateScale(6),
  },
  sectionHeading: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(10),
  },
  emptyCategories: {
    backgroundColor: COLORS.white,
    padding: moderateScale(24),
    borderRadius: moderateScale(16),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(14),
    padding: moderateScale(14),
    marginBottom: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    ...SHADOWS.soft,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  categoryDot: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
  },
  categoryName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
  },
  categoryTxCount: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
    marginTop: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
  },
  categoryPercentage: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
    fontWeight: '600',
    marginTop: 1,
  },
  catBarTrack: {
    height: moderateScale(5),
    backgroundColor: 'rgba(219, 237, 240, 0.5)',
    borderRadius: moderateScale(3),
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: moderateScale(3),
  },
});