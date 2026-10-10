import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Search, Users, X } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { getGroups } from '../../store/groupExpenseSlice';
import { Group } from '../../types/groupExpense';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import GroupCard from '../../components/groupExpense/GroupCard';
import { calculateBalances } from '../../utils/groupExpense/calculateBalances';
import { getAllExpenses, getAllGroups } from '../../store/api';

export const GroupExpensesScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const [searchQuery, setSearchQuery] = useState('');

  const groups = useAppSelector(getGroups);
  const expenses = useAppSelector((state) => state.groupExpense.expenses);
  const settlements = useAppSelector((state) => state.groupExpense.settlements);
  const currentUser = useAppSelector((state) => state.groupExpense.currentUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAllExpenses())
    dispatch(getAllGroups());
  }, []);
  console.log("###### groupexpensescren ", groups)
  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    return groups.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [groups, searchQuery]);

  const handleGroupPress = (group: Group) => {
    navigation.navigate(SCREEN_NAMES.GROUP_DETAILS, { groupId: group.id });
  };

  const handleCreateGroup = () => {
    navigation.navigate(SCREEN_NAMES.CREATE_GROUP);
  };

  return (
    <View style={[styles.safeArea, { paddingTop: topInset }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={moderateScale(24)} color={COLORS.navy} strokeWidth={2.4} />
        </Pressable>

        <Text style={styles.headerTitle}>Group Expenses</Text>

        <Pressable
          onPress={handleCreateGroup}
          hitSlop={10}
          style={styles.headerAddButton}
          accessibilityRole="button"
          accessibilityLabel="Create group"
        >
          <Plus size={moderateScale(22)} color={COLORS.white} strokeWidth={2.6} />
        </Pressable>
      </View>

      <FlatList
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search
                size={moderateScale(18)}
                color={COLORS.textMuted}
                strokeWidth={2.2}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search groups"
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  hitSlop={8}
                  style={styles.clearSearch}
                >
                  <X size={moderateScale(16)} color={COLORS.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Your groups</Text>
              <Text style={styles.groupCountBadge}>
                {filteredGroups.length}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const groupExpenses = expenses.filter(
            (e) => String(e.groupId || (e as any).group_id) === String(item.id)
          );
          const groupSettlements = settlements.filter(
            (s) => String(s.groupId) === String(item.id)
          );
          const balanceCalc = calculateBalances(
            item,
            groupExpenses,
            groupSettlements,
            currentUser?.id
          );

          return (
            <GroupCard
              group={item}
              expenseCount={groupExpenses.length}
              balanceCalculation={balanceCalc}
              onPress={handleGroupPress}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Users
                size={moderateScale(36)}
                color={COLORS.primary}
                strokeWidth={2}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No groups found' : 'No groups yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No group matched "${searchQuery}"`
                : 'Create your first group to start sharing expenses with friends.'}
            </Text>
            {!searchQuery && (
              <Pressable
                onPress={handleCreateGroup}
                style={styles.emptyButton}
              >
                <Plus size={moderateScale(18)} color={COLORS.white} strokeWidth={2.4} />
                <Text style={styles.emptyButtonText}>Create group</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingVertical: moderateScale(14),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: COLORS.navy,
  },
  headerAddButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.expense,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  contentContainer: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingBottom: moderateScale(40),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(48),
    marginTop: moderateScale(6),
    marginBottom: moderateScale(18),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...SHADOWS.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: COLORS.navy,
    marginLeft: moderateScale(10),
    paddingVertical: 0,
  },
  clearSearch: {
    padding: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(14),
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: COLORS.navy,
  },
  groupCountBadge: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.textSecondary,
    backgroundColor: '#E2EFF5',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(10),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(60),
    paddingHorizontal: moderateScale(24),
  },
  emptyIconCircle: {
    width: moderateScale(76),
    height: moderateScale(76),
    borderRadius: moderateScale(38),
    backgroundColor: '#E8F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(16),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: moderateScale(6),
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(14),
    gap: moderateScale(8),
    ...SHADOWS.soft,
  },
  emptyButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default GroupExpensesScreen;
