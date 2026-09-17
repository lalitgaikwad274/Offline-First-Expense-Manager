import React, { useState, useMemo } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Filter, Plus, Receipt } from 'lucide-react-native';
import { useAppSelector } from '../../store';
import { COLORS, moderateScale, SHADOWS } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import ExpenseCard from '../../components/ExpenseCard';
import BottomNavigation from '../../components/BottomNavigation';
import { Expense } from '../../types/expense';

const FILTER_OPTIONS = ['All', 'Synced', 'Pending'] as const;
type FilterOption = typeof FILTER_OPTIONS[number];

const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const expenses = useAppSelector(state => state.expense.expenses);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');

  const filteredExpenses = useMemo(() => {
    if (selectedFilter === 'Synced') {
      return expenses.filter(e => e.synced);
    }
    if (selectedFilter === 'Pending') {
      return expenses.filter(e => !e.synced);
    }
    return expenses;
  }, [expenses, selectedFilter]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredExpenses]);

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
          <Text style={styles.headerTitle}>Transactions</Text>
          <Text style={styles.headerSubtitle}>
            {filteredExpenses.length} records · ₹{totalAmount.toLocaleString('en-IN')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate(SCREEN_NAMES.ADD_EXPENSE)}
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel="Add New Expense"
        >
          <Plus size={moderateScale(20)} color={COLORS.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map(filter => {
          const isSelected = selectedFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                isSelected && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Transactions List */}
      <View style={styles.listContainer}>
        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Receipt size={moderateScale(38)} color={COLORS.gray} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptyDesc}>
              {selectedFilter === 'Pending'
                ? 'All your transactions are currently synchronized.'
                : 'Tap the + button above to record a new expense.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredExpenses}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ExpenseCard
                expense={item}
                onPress={() => {
                  navigation.navigate(SCREEN_NAMES.EXPENSE_DETAILS, {
                    expenseId: item.id,
                  });
                }}
              />
            )}
          />
        )}
      </View>

      {/* Bottom Navigation with Active Tab */}
      <BottomNavigation activeTab="transactions" />
    </SafeAreaView>
  );
};

export default TransactionsScreen;

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
  addButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: COLORS.expense,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    gap: moderateScale(8),
  },
  filterChip: {
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(18),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.9)',
  },
  filterChipActive: {
    backgroundColor: COLORS.petrol,
    borderColor: COLORS.petrol,
  },
  filterChipText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.navy,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(95),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(32),
  },
  emptyIconCircle: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    backgroundColor: 'rgba(219, 245, 248, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(14),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(4),
  },
  emptyDesc: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
});