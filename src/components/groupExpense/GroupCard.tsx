import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Group, GroupBalanceCalculation } from '../../types/groupExpense';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';

export interface GroupCardProps {
  group: Group;
  expenseCount: number;
  balanceCalculation: GroupBalanceCalculation;
  onPress: (group: Group) => void;
}

export const GroupCard = memo(({
  group,
  expenseCount,
  balanceCalculation,
  onPress,
}: GroupCardProps) => {
  const memberCount = group.members?.length || 0;
  const myNet = balanceCalculation.myNetBalance;

  const isOwed = myNet > 0.01;
  const owes = myNet < -0.01;
  const isSettled = !isOwed && !owes;

  return (
    <Pressable
      onPress={() => onPress(group)}
      style={({ pressed }) => [
        styles.card,
        owes && styles.cardOwing,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${group.name}, ${memberCount} members`}
    >
      <View style={styles.contentRow}>
        {/* Group Avatar / Emoji Icon */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{group.avatarIcon || '👥'}</Text>
        </View>

        {/* Group Info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {group.name}
            </Text>
            <ChevronRight size={moderateScale(18)} color={COLORS.textMuted} />
          </View>

          <Text style={styles.subtitle}>
            {memberCount} {memberCount === 1 ? 'member' : 'members'} · {expenseCount}{' '}
            {expenseCount === 1 ? 'expense' : 'expenses'}
          </Text>

          {/* Balance Status Badge */}
          <View style={styles.statusRow}>
            {isOwed && (
              <View style={styles.statusBadgeOwed}>
                <Text style={styles.statusLabelOwed}>You are owed</Text>
                <Text style={styles.statusAmountOwed}>
                  ₹{Math.abs(myNet).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {owes && (
              <View style={styles.statusBadgeOwe}>
                <Text style={styles.statusLabelOwe}>You owe</Text>
                <Text style={styles.statusAmountOwe}>
                  ₹{Math.abs(myNet).toLocaleString('en-IN')}
                </Text>
              </View>
            )}

            {isSettled && (
              <View style={styles.statusBadgeSettled}>
                <Text style={styles.statusLabelSettled}>Settled up</Text>
                <Text style={styles.statusAmountSettled}>₹0</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginBottom: moderateScale(14),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...SHADOWS.soft,
  },
  cardOwing: {
    backgroundColor: '#FFF9F9',
    borderColor: '#FFE3E5',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(16),
    backgroundColor: '#E8F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(14),
    borderWidth: 1,
    borderColor: '#D2EFF2',
  },
  avatarEmoji: {
    fontSize: moderateScale(26),
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.navy,
    flex: 1,
    marginRight: moderateScale(8),
  },
  subtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: moderateScale(3),
    fontWeight: '500',
  },
  statusRow: {
    marginTop: moderateScale(10),
  },
  statusBadgeOwed: {
    alignSelf: 'flex-start',
  },
  statusLabelOwed: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.incomeDark,
  },
  statusAmountOwed: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.incomeDark,
    marginTop: moderateScale(1),
  },
  statusBadgeOwe: {
    alignSelf: 'flex-start',
  },
  statusLabelOwe: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.expenseDark,
  },
  statusAmountOwe: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.expenseDark,
    marginTop: moderateScale(1),
  },
  statusBadgeSettled: {
    alignSelf: 'flex-start',
  },
  statusLabelSettled: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.incomeDark,
  },
  statusAmountSettled: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.incomeDark,
    marginTop: moderateScale(1),
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});

export default GroupCard;
