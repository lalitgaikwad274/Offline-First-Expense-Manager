import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { GroupMember, MemberBalanceInfo, SimplifiedDebt } from '../../types/groupExpense';
import { COLORS, SHADOWS, moderateScale } from '../../utils/constants';

export interface MemberBalanceRowProps {
  balanceInfo: MemberBalanceInfo;
  onSettle: (member: GroupMember, amount: number, direction: 'theyOweYou' | 'youOweThem') => void;
}

export const MemberBalanceRow = memo(({
  balanceInfo,
  onSettle,
}: MemberBalanceRowProps) => {
  const { member, userOwedAmount } = balanceInfo;
  const theyOweYou = userOwedAmount > 0.01;
  const youOweThem = userOwedAmount < -0.01;
  const isSettled = !theyOweYou && !youOweThem;

  const avatarColor = member.color || '#845EF7';
  const absAmount = Math.abs(userOwedAmount);

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{member.initials || 'U'}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {member.name}
          </Text>
          <Text
            style={[
              styles.statusText,
              theyOweYou && styles.statusOwed,
              youOweThem && styles.statusOwe,
              isSettled && styles.statusSettled,
            ]}
          >
            {theyOweYou ? 'owes you' : youOweThem ? 'you owe' : 'settled up'}
          </Text>
        </View>
      </View>

      <View style={styles.rightGroup}>
        <Text
          style={[
            styles.amount,
            theyOweYou && styles.amountOwed,
            youOweThem && styles.amountOwe,
            isSettled && styles.amountSettled,
          ]}
        >
          ₹{absAmount.toLocaleString('en-IN')}
        </Text>

        {!isSettled && (
          <Pressable
            onPress={() =>
              onSettle(
                member,
                absAmount,
                theyOweYou ? 'theyOweYou' : 'youOweThem'
              )
            }
            style={({ pressed }) => [
              styles.settleButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.settleButtonText}>Settle</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});

export interface SimplifiedDebtCardProps {
  debt: SimplifiedDebt;
  onSettle?: (debt: SimplifiedDebt) => void;
}

export const SimplifiedDebtCard = memo(({ debt, onSettle }: SimplifiedDebtCardProps) => {
  const isFromMe = debt.fromUserName === 'You';
  const isToMe = debt.toUserName === 'you' || debt.toUserName === 'You';

  return (
    <View style={styles.simplifiedCard}>
      <View style={styles.simplifiedLeft}>
        <View style={[styles.miniAvatar, { backgroundColor: isFromMe ? COLORS.primary : '#845EF7' }]}>
          <Text style={styles.miniAvatarText}>{debt.fromUserInitials || 'U'}</Text>
        </View>

        <View style={styles.simplifiedInfo}>
          <Text style={styles.simplifiedText}>
            <Text style={styles.simplifiedBold}>{debt.fromUserName}</Text>
            {' pays '}
            <Text style={styles.simplifiedBold}>{debt.toUserName}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.simplifiedRight}>
        <Text style={styles.simplifiedAmount}>
          ₹{debt.amount.toLocaleString('en-IN')}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    marginBottom: moderateScale(10),
    borderWidth: 1,
    borderColor: '#EEF3F7',
    ...SHADOWS.soft,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  avatarText: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: COLORS.white,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },
  statusText: {
    fontSize: moderateScale(12),
    marginTop: 2,
    fontWeight: '600',
  },
  statusOwed: {
    color: COLORS.incomeDark,
  },
  statusOwe: {
    color: COLORS.expenseDark,
  },
  statusSettled: {
    color: COLORS.textMuted,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  amount: {
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  amountOwed: {
    color: COLORS.incomeDark,
  },
  amountOwe: {
    color: COLORS.expenseDark,
  },
  amountSettled: {
    color: COLORS.textMuted,
  },
  settleButton: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(5),
    backgroundColor: '#FFFFFF',
  },
  settleButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.primary,
  },
  simplifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    marginBottom: moderateScale(8),
    borderWidth: 1,
    borderColor: '#E8EEF3',
  },
  simplifiedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  miniAvatar: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  miniAvatarText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    color: COLORS.white,
  },
  simplifiedInfo: {
    flex: 1,
  },
  simplifiedText: {
    fontSize: moderateScale(13),
    color: COLORS.navy,
  },
  simplifiedBold: {
    fontWeight: '700',
  },
  simplifiedRight: {
    alignItems: 'flex-end',
  },
  simplifiedAmount: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: COLORS.navy,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default MemberBalanceRow;
