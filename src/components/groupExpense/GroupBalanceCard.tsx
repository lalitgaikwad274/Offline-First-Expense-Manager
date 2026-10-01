import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS, SHADOWS, moderateScale } from '../../utils/constants';

export interface GroupBalanceCardProps {
  myNetBalance: number;
  avatarIcon?: string;
  onPress?: () => void;
}

export const GroupBalanceCard = memo(({
  myNetBalance,
  avatarIcon = '🌴',
  onPress,
}: GroupBalanceCardProps) => {
  const isOwed = myNetBalance > 0.01;
  const owes = myNetBalance < -0.01;
  const isSettled = !isOwed && !owes;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        owes && styles.cardOwing,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="View group balances"
    >
      <View style={styles.leftGroup}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconEmoji}>{avatarIcon}</Text>
        </View>

        <View style={styles.textContainer}>
          {isOwed && (
            <>
              <Text style={styles.labelOwed}>You are owed</Text>
              <Text style={styles.amountOwed}>
                ₹{Math.abs(myNetBalance).toLocaleString('en-IN')}
              </Text>
            </>
          )}

          {owes && (
            <>
              <Text style={styles.labelOwe}>You owe</Text>
              <Text style={styles.amountOwe}>
                ₹{Math.abs(myNetBalance).toLocaleString('en-IN')}
              </Text>
            </>
          )}

          {isSettled && (
            <>
              <Text style={styles.labelSettled}>Settled up</Text>
              <Text style={styles.amountSettled}>₹0</Text>
            </>
          )}
        </View>
      </View>

      <ChevronRight size={moderateScale(20)} color={COLORS.textSecondary} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E4F6F1',
    borderRadius: moderateScale(18),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(14),
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: '#C6EFE4',
    ...SHADOWS.soft,
  },
  cardOwing: {
    backgroundColor: '#FFEFEF',
    borderColor: '#FFD6D9',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(14),
  },
  iconContainer: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(14),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconEmoji: {
    fontSize: moderateScale(22),
  },
  textContainer: {
    justifyContent: 'center',
  },
  labelOwed: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.incomeDark,
  },
  amountOwed: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.incomeDark,
    marginTop: 1,
  },
  labelOwe: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.expenseDark,
  },
  amountOwe: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.expenseDark,
    marginTop: 1,
  },
  labelSettled: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.incomeDark,
  },
  amountSettled: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.incomeDark,
    marginTop: 1,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
});

export default GroupBalanceCard;
