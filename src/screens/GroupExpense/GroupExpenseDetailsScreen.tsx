import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Edit3,
  Receipt,
  Tag,
  Trash2,
  Users,
  Utensils,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteExpense } from '../../store/expenseSlice';
import {
  deleteGroupExpense,
  getGroupById,
  getGroupExpenseById,
} from '../../store/groupExpenseSlice';
import { GroupMember } from '../../types/groupExpense';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';
import { deleteGroupExpenseApi } from '../../store/api';

const formatDateFull = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recently';
  }
};

export const GroupExpenseDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const { groupId, expenseId } = route.params || {};

  const group = useAppSelector(getGroupById(groupId));
  const expense = useAppSelector(getGroupExpenseById(expenseId));
  const currentUser = useAppSelector((state) => state.groupExpense.currentUser);

  if (!group || !expense) {
    return (
      <View style={[styles.safeArea, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.expense, fontSize: 16 }}>Expense not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const memberMap = new Map<string, GroupMember>();
  group?.members?.forEach((m) => memberMap.set(String(m.id), m));
  const payerId = String(expense.paidBy || expense.paid_by || '');
  const payer = memberMap.get(payerId);
  const isPayerMe = payerId === String(currentUser?.id) || payer?.isCurrentUser;

  const participantsList = Array.isArray(expense?.participants) && expense.participants.length > 0
    ? expense.participants
    : Array.isArray(expense?.splits)
    ? expense.splits.map((s: any) => ({
        userId: String(s.member_id ?? s.userId ?? ''),
        amount: typeof s.amount === 'number' ? s.amount : parseFloat(s.amount) || 0,
        member_name: s.member_name,
        percentage: s.percentage,
        shares: s.shares,
      }))
    : [];

  const myParticipant = participantsList.find(
    (p: any) => String(p.userId) === String(currentUser?.id) || memberMap.get(String(p.userId))?.isCurrentUser
  );

  const expenseAmount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;
  let impactLabel = '';
  let impactAmount = 0;
  let impactType: 'getBack' | 'owe' | 'none' = 'none';

  if (isPayerMe) {
    const myShare = myParticipant ? (typeof myParticipant.amount === 'number' ? myParticipant.amount : parseFloat(myParticipant.amount) || 0) : 0;
    impactAmount = Number((expenseAmount - myShare).toFixed(2));
    if (impactAmount > 0) {
      impactLabel = 'You get back';
      impactType = 'getBack';
    }
  } else if (myParticipant) {
    const myShare = typeof myParticipant.amount === 'number' ? myParticipant.amount : parseFloat(myParticipant.amount) || 0;
    if (myShare > 0) {
      impactAmount = myShare;
      impactLabel = 'You owe';
      impactType = 'owe';
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
                console.log("#####!!! expense", expense)

            dispatch(deleteGroupExpenseApi(groupId, expenseId));
            // dispatch(deleteExpense(expense.id));
            navigation.goBack();
          },
        },
      ]
    );
  };
console.log("######$#$#$ expense", expense)
  return (
    <View style={[styles.safeArea, { paddingTop: topInset }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backButton}
        >
          <ArrowLeft size={moderateScale(24)} color={COLORS.navy} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.headerTitle}>Expense Details</Text>
        <Pressable onPress={handleDelete} hitSlop={12} style={styles.deleteHeaderButton}>
          <Trash2 size={moderateScale(20)} color={COLORS.expense} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Expense Card */}
        <View style={styles.mainCard}>
          <View style={styles.iconCircle}>
            <Utensils size={moderateScale(28)} color={COLORS.primary} strokeWidth={2.4} />
          </View>

          <Text style={styles.expenseTitle}>{expense.description}</Text>
          <Text style={styles.expenseAmount}>
            ₹{expense.amount.toLocaleString('en-IN')}
          </Text>

          <View style={styles.categoryBadge}>
            <Tag size={moderateScale(12)} color={COLORS.primary} />
            <Text style={styles.categoryText}>{expense.category || 'Food & Dining'}</Text>
          </View>

          {/* Impact Banner */}
          {impactType !== 'none' && (
            <View
              style={[
                styles.impactBanner,
                impactType === 'getBack'
                  ? styles.impactBannerGetBack
                  : styles.impactBannerOwe,
              ]}
            >
              <Text
                style={[
                  styles.impactLabel,
                  impactType === 'getBack'
                    ? styles.impactLabelGetBack
                    : styles.impactLabelOwe,
                ]}
              >
                {impactLabel}
              </Text>
              <Text
                style={[
                  styles.impactAmount,
                  impactType === 'getBack'
                    ? styles.impactAmountGetBack
                    : styles.impactAmountOwe,
                ]}
              >
                ₹{impactAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        </View>

        {/* Payer and Date Info */}
        <View style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Paid by</Text>
            <View style={styles.infoRight}>
              <View
                style={[
                  styles.miniAvatar,
                  { backgroundColor: payer?.color || COLORS.primary },
                ]}
              >
                <Text style={styles.miniAvatarText}>{payer?.initials || 'U'}</Text>
              </View>
              <Text style={styles.infoValue}>
                {payer?.name} {isPayerMe ? '(You)' : ''}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValueDate}>
              {formatDateFull(expense.date)}
            </Text>
          </View>
        </View>

        {/* Split Details Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>
            Split ({participantsList.length} people ·{' '}
            {expense.splitType === 'equal'
              ? 'Equal'
              : expense.splitType === 'exact'
              ? 'Exact'
              : expense.splitType === 'percentage'
              ? 'Percentage'
              : 'Shares'}
            )
          </Text>

          {participantsList.map((p: any, idx: number) => {
            const member = memberMap.get(String(p.userId));
            const isMe = String(p.userId) === String(currentUser?.id) || member?.isCurrentUser;
            const pAmount = typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0;
            return (
              <View key={p.userId || idx} style={styles.participantRow}>
                <View style={styles.participantLeft}>
                  <View
                    style={[
                      styles.miniAvatar,
                      { backgroundColor: member?.color || '#845EF7' },
                    ]}
                  >
                    <Text style={styles.miniAvatarText}>
                      {(p?.member_name || member?.name || 'U').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.participantName}>
                    {p?.member_name || member?.name || 'Member'} {isMe ? '(You)' : ''}
                  </Text>
                </View>

                <Text style={styles.participantAmount}>
                  ₹{pAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Notes section if any */}
        {expense.notes ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Notes</Text>
            <Text style={styles.notesText}>{expense.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
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
    fontSize: moderateScale(19),
    fontWeight: '800',
    color: COLORS.navy,
  },
  deleteHeaderButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(14),
    backgroundColor: '#FFF0F2',
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(40),
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(22),
    padding: moderateScale(22),
    alignItems: 'center',
    marginBottom: moderateScale(16),
    ...SHADOWS.soft,
  },
  iconCircle: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: '#E8F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(12),
  },
  expenseTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: moderateScale(28),
    fontWeight: '900',
    color: COLORS.navy,
    marginBottom: moderateScale(10),
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F7',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(12),
    gap: 4,
  },
  categoryText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  impactBanner: {
    marginTop: moderateScale(16),
    width: '100%',
    borderRadius: moderateScale(14),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactBannerGetBack: {
    backgroundColor: '#E8FAF3',
  },
  impactBannerOwe: {
    backgroundColor: '#FFE9EC',
  },
  impactLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  impactLabelGetBack: {
    color: COLORS.incomeDark,
  },
  impactLabelOwe: {
    color: COLORS.expenseDark,
  },
  impactAmount: {
    fontSize: moderateScale(20),
    fontWeight: '900',
    marginTop: 2,
  },
  impactAmountGetBack: {
    color: COLORS.incomeDark,
  },
  impactAmountOwe: {
    color: COLORS.expenseDark,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginBottom: moderateScale(14),
    ...SHADOWS.soft,
  },
  sectionHeading: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: moderateScale(12),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  infoLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(8),
  },
  miniAvatarText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: COLORS.white,
  },
  infoValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
  },
  infoValueDate: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.navy,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.navy,
  },
  participantAmount: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: COLORS.navy,
  },
  notesText: {
    fontSize: moderateScale(14),
    color: COLORS.navy,
    lineHeight: moderateScale(20),
  },
});

export default GroupExpenseDetailsScreen;
