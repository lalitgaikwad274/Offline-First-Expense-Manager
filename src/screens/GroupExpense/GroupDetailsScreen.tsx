import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Receipt,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  addGroupMember,
  getGroupBalances,
  getGroupById,
  getGroupExpenses,
  removeGroupMember,
  setGroupExpenses,
} from '../../store/groupExpenseSlice';
import { Group, GroupExpense, GroupMember, SimplifiedDebt } from '../../types/groupExpense';
import { formatGroupExpense } from '../../utils/helpers';
import { CONTACTS_POOL } from '../../utils/groupExpense/mockData';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import GroupBalanceCard from '../../components/groupExpense/GroupBalanceCard';
import GroupExpenseCard from '../../components/groupExpense/GroupExpenseCard';
import { MemberBalanceRow, SimplifiedDebtCard } from '../../components/groupExpense/SettlementCard';
import MemberRow from '../../components/groupExpense/MemberRow';
import { serverCall } from '../../services/api';
import { ENDPOINTS } from '../../utils/ApiConstants';
import { getGroupByIdApi } from '../../store/api';

export const GroupDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const groupId = route.params?.groupId;

  useEffect(() => {
    if (!groupId) {
      Alert.alert('Error', 'Group ID is missing. Please go back and try again.');
      navigation.goBack();
    }
    else{
      dispatch(getGroupByIdApi(groupId));
    }
  }, [groupId]);

  const groupData = useAppSelector(getGroupById(groupId));
  
  const expenses = useAppSelector(getGroupExpenses(groupId));
  const balanceInfo = useAppSelector(getGroupBalances(groupId));
  const currentUser = useAppSelector((state) => state.groupExpense.currentUser);
  const [group, setGroup] = useState<Group | null>(groupData || null);
  const [isLoading, setIsLoading] = useState(!groupData);
  const [activeTab, setActiveTab] = useState<'Expenses' | 'Balances' | 'Members'>('Expenses');

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  console.log("####groupId : ", groupId);

  const getGroupDeatils = async () => {
    try {
      setIsLoading(true);
      const response = await serverCall(ENDPOINTS.GET_GROUP_DETAILS(groupId), "GET");
      console.log("#######response ", response);
      if (response?.data && Object.keys(response?.data).length > 0) {
        setGroup(response.data);
        if (Array.isArray(response.data.expenses) && response.data.expenses.length > 0) {
          const formattedExpenses = response.data.expenses.map(formatGroupExpense);
          dispatch(setGroupExpenses(formattedExpenses));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (groupData) {
      setGroup(groupData);
      setIsLoading(false);
    } else if (groupId) {
      getGroupDeatils();
    }
  }, [groupData, groupId]);

  // Show loader while fetching or before group data is set
  if (isLoading) {
    return (
      <View style={[styles.safeArea, { paddingTop: topInset }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.headerButton}
          >
            <ArrowLeft size={moderateScale(24)} color={COLORS.navy} strokeWidth={2.4} />
          </Pressable>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Loading...
            </Text>
          </View>

          <View style={{ width: moderateScale(40) }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading group details...</Text>
        </View>
      </View>
    );
  }

  if (!group || !group.name) {
    return (
      <View style={[styles.safeArea, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.errorText}>Group not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backHomeBtn}>
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddExpense = () => {
    navigation.navigate(SCREEN_NAMES.ADD_GROUP_EXPENSE, { groupId: group.id });
  };

  const handleExpensePress = (exp: GroupExpense) => {
    navigation.navigate(SCREEN_NAMES.GROUP_EXPENSE_DETAILS, {
      groupId: group.id,
      expenseId: exp.id,
    });
  };

  const handleSettingsPress = () => {
    navigation.navigate(SCREEN_NAMES.GROUP_SETTINGS, { groupId: group.id });
  };

  const handleSettlePress = (
    member: GroupMember,
    amount: number,
    direction: 'theyOweYou' | 'youOweThem'
  ) => {
    navigation.navigate(SCREEN_NAMES.SETTLE_GROUP, {
      groupId: group.id,
      fromUserId: direction === 'theyOweYou' ? member.id : currentUser.id,
      toUserId: direction === 'theyOweYou' ? currentUser.id : member.id,
      suggestedAmount: amount,
      targetMember: member,
      direction,
    });
  };

  const handleRemoveMember = (member: GroupMember) => {
    // Check if member has involved expenses
    const hasExpenses = expenses.some(
      (e) =>
        e.paidBy === member.id ||
        e.participants.some((p) => p.userId === member.id)
    );

    if (hasExpenses) {
      Alert.alert(
        'Cannot Remove Member',
        `${member.name} has existing expenses in this group. Please delete or update those expenses before removing this member.`
      );
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from ${group.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeGroupMember({ groupId: group.id, memberId: member.id }));
          },
        },
      ]
    );
  };

  const handleAddNewMemberSubmit = () => {
    if (!newMemberName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for the member');
      return;
    }

    const newId = `user_${Date.now()}`;
    const initials = newMemberName
      .trim()
      .split(' ')
      .map((p) => p[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2);

    const newMember: GroupMember = {
      id: newId,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || undefined,
      initials: initials || 'U',
      color: '#339AF0',
    };

    dispatch(addGroupMember({ groupId: group.id, member: newMember }));
    setNewMemberName('');
    setNewMemberPhone('');
    setShowAddMemberModal(false);
  };

  const membersList = Array.isArray(group?.members) ? group.members : [];
  console.log("####### membersList",membersList)
  return (
    <View style={[styles.safeArea, { paddingTop: topInset }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.headerButton}
        >
          <ArrowLeft size={moderateScale(24)} color={COLORS.navy} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={styles.headerSubtitle}>
            {membersList.length} {membersList.length === 1 ? 'member' : 'members'}
          </Text>
        </View>

        <Pressable
          onPress={handleSettingsPress}
          hitSlop={12}
          style={styles.headerButton}
        >
          <Settings size={moderateScale(22)} color={COLORS.navy} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: moderateScale(100) },
        ]}
      >
        {/* Top Balance Summary Card */}
        <GroupBalanceCard
          myNetBalance={balanceInfo.myNetBalance}
          avatarIcon={group.avatarIcon}
          onPress={() => setActiveTab('Balances')}
        />

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          {(['Expenses', 'Balances', 'Members'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive && styles.tabButtonTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* TAB 1: Expenses */}
        {activeTab === 'Expenses' && (
          <View style={styles.tabContent}>
            {expenses.length > 0 && (
              <View style={styles.expensesSectionHeader}>
                <Text style={styles.dateGroupHeader}>Today</Text>
              </View>
            )}

            {expenses.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <Receipt
                    size={moderateScale(32)}
                    color={COLORS.primary}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.emptyTitle}>No expenses yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add your first shared expense with {group.name}.
                </Text>
              </View>
            ) : (
              expenses.map((expense) => (
                <GroupExpenseCard
                  key={expense.id}
                  expense={expense}
                  members={membersList}
                  currentUserId={currentUser.id}
                  onPress={handleExpensePress}
                />
              ))
            )}
          </View>
        )}

        {/* TAB 2: Balances */}
        {activeTab === 'Balances' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Member balances</Text>

            {balanceInfo.memberBalances.length === 0 ? (
              <Text style={styles.emptySubtitle}>No other members in group</Text>
            ) : (
              balanceInfo.memberBalances.map((item) => (
                <MemberBalanceRow
                  key={item.member.id}
                  balanceInfo={item}
                  onSettle={handleSettlePress}
                />
              ))
            )}

            {/* Simplify Debts Section */}
            {group.simplifyDebts !== false &&
              balanceInfo.simplifiedDebts.length > 0 && (
                <View style={styles.simplifySection}>
                  <View style={styles.simplifyHeader}>
                    <Sparkles size={moderateScale(18)} color={COLORS.primary} />
                    <Text style={styles.simplifyTitle}>Simplify debts</Text>
                  </View>
                  <Text style={styles.simplifySubtitle}>
                    Settle with {balanceInfo.simplifiedDebts.length}{' '}
                    {balanceInfo.simplifiedDebts.length === 1 ? 'payment' : 'payments'}{' '}
                    instead of individual pairwise splits.
                  </Text>

                  {balanceInfo.simplifiedDebts.map((debt, index) => (
                    <SimplifiedDebtCard key={index} debt={debt} />
                  ))}
                </View>
              )}
          </View>
        )}

        {/* TAB 3: Members */}
        {activeTab === 'Members' && (
          <View style={styles.tabContent}>
            <View style={styles.membersHeaderRow}>
              <Text style={styles.sectionHeading}>Group members</Text>
              <Pressable
                onPress={() => setShowAddMemberModal(true)}
                style={styles.addMemberSmallBtn}
              >
                <Plus size={moderateScale(16)} color={COLORS.white} strokeWidth={2.6} />
                <Text style={styles.addMemberSmallText}>Add</Text>
              </Pressable>
            </View>

            {membersList.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                canRemove={group.createdBy === currentUser.id}
                onRemove={handleRemoveMember}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA Floating Button for Add Expense */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          onPress={handleAddExpense}
          style={styles.addExpenseButton}
          activeOpacity={0.88}
        >
          <Plus size={moderateScale(20)} color={COLORS.white} strokeWidth={2.6} />
          <Text style={styles.addExpenseButtonText}>Add expense</Text>
        </TouchableOpacity>
      </View>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Group Member</Text>
              <Pressable
                onPress={() => setShowAddMemberModal(false)}
                hitSlop={8}
              >
                <X size={moderateScale(20)} color={COLORS.navy} />
              </Pressable>
            </View>

            <Text style={styles.modalInputLabel}>Name</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor={COLORS.textMuted}
              value={newMemberName}
              onChangeText={setNewMemberName}
              autoFocus
            />

            <Text style={[styles.modalInputLabel, { marginTop: moderateScale(12) }]}>
              Phone (optional)
            </Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="+91 98765 43210"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={newMemberPhone}
              onChangeText={setNewMemberPhone}
            />

            <TouchableOpacity
              onPress={handleAddNewMemberSubmit}
              style={styles.modalAddSubmitBtn}
            >
              <Text style={styles.modalAddSubmitText}>Add Member</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingVertical: moderateScale(12),
  },
  headerButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  headerTitleGroup: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: moderateScale(10),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: moderateScale(8),
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: moderateScale(14),
    padding: 4,
    marginBottom: moderateScale(16),
  },
  tabButton: {
    flex: 1,
    paddingVertical: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(11),
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.soft,
  },
  tabButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.navy,
    fontWeight: '800',
  },
  tabContent: {
    marginBottom: moderateScale(16),
  },
  expensesSectionHeader: {
    marginBottom: moderateScale(10),
  },
  dateGroupHeader: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sectionHeading: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: moderateScale(12),
  },
  simplifySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(18),
    padding: moderateScale(16),
    marginTop: moderateScale(14),
    ...SHADOWS.soft,
  },
  simplifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginBottom: moderateScale(4),
  },
  simplifyTitle: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: COLORS.navy,
  },
  simplifySubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    lineHeight: moderateScale(17),
    marginBottom: moderateScale(12),
  },
  membersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(12),
  },
  addMemberSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(10),
    gap: 4,
  },
  addMemberSmallText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.white,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(10),
    ...SHADOWS.soft,
  },
  emptyIconCircle: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: '#E8F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(14),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: '#EBF1F5',
    ...SHADOWS.medium,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07517D', // Solid dark teal matching reference image
    borderRadius: moderateScale(16),
    height: moderateScale(50),
    gap: moderateScale(8),
  },
  addExpenseButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 27, 58, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenPaddingHorizontal,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
  },
  modalInputLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(6),
  },
  modalTextInput: {
    backgroundColor: '#F2F8FC',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(46),
    fontSize: moderateScale(15),
    color: COLORS.navy,
    borderWidth: 1,
    borderColor: '#E2ECF2',
  },
  modalAddSubmitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(14),
    height: moderateScale(48),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(20),
  },
  modalAddSubmitText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.white,
  },
  errorText: {
    fontSize: moderateScale(16),
    color: COLORS.expense,
    fontWeight: '700',
    marginBottom: moderateScale(12),
  },
  backHomeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(12),
  },
  backHomeBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: moderateScale(60),
  },
  loadingText: {
    fontSize: moderateScale(15),
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: moderateScale(14),
  },
});

export default GroupDetailsScreen;
