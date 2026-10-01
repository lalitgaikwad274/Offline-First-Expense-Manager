import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Sparkles, Users } from 'lucide-react-native';
import { useAppSelector } from '../../store';
import { getGroupBalances, getGroupById } from '../../store/groupExpenseSlice';
import { GroupMember } from '../../types/groupExpense';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import GroupBalanceCard from '../../components/groupExpense/GroupBalanceCard';
import { MemberBalanceRow, SimplifiedDebtCard } from '../../components/groupExpense/SettlementCard';

export const GroupBalancesScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const groupId = route.params?.groupId;
  const group = useAppSelector(getGroupById(groupId));
  const balanceInfo = useAppSelector(getGroupBalances(groupId));
  const currentUser = useAppSelector((state) => state.groupExpense.currentUser);

  if (!group) {
    return (
      <View style={[styles.safeArea, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.expense, fontSize: 16 }}>Group not found</Text>
      </View>
    );
  }

  const handleSettle = (
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
        <Text style={styles.headerTitle}>Balances</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Balance Banner */}
        <GroupBalanceCard
          myNetBalance={balanceInfo.myNetBalance}
          avatarIcon={group.avatarIcon}
        />

        {/* Member Balances List */}
        <Text style={styles.sectionHeading}>Member balances</Text>

        {balanceInfo.memberBalances.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No other members in group</Text>
          </View>
        ) : (
          balanceInfo.memberBalances.map((item) => (
            <MemberBalanceRow
              key={item.member.id}
              balanceInfo={item}
              onSettle={handleSettle}
            />
          ))
        )}

        {/* Simplify Debts Section */}
        {group.simplifyDebts !== false && balanceInfo.simplifiedDebts.length > 0 && (
          <View style={styles.simplifySection}>
            <View style={styles.simplifyHeader}>
              <Sparkles size={moderateScale(18)} color={COLORS.primary} />
              <Text style={styles.simplifyTitle}>Simplify debts</Text>
            </View>
            <Text style={styles.simplifySubtitle}>
              Settle with {balanceInfo.simplifiedDebts.length}{' '}
              {balanceInfo.simplifiedDebts.length === 1 ? 'payment' : 'payments'} instead of{' '}
              multiple transactions.
            </Text>

            {balanceInfo.simplifiedDebts.map((debt, idx) => (
              <SimplifiedDebtCard key={idx} debt={debt} />
            ))}
          </View>
        )}
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
  scrollContent: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(40),
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
    marginTop: moderateScale(16),
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: moderateScale(14),
  },
});

export default GroupBalancesScreen;
