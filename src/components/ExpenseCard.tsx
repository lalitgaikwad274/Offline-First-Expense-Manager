import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CloudOff } from 'lucide-react-native';
import { Expense } from '../types/expense';
import { COLORS, moderateScale } from '../utils/constants';
import { formatCurrency, getCategoryIcon } from '../utils/helpers';

export interface ExpenseCardProps {
  item?: Expense;
  expense?: Expense;
  isLast?: boolean;
  variant?: 'standalone' | 'row';
  onPress?: (expense: Expense) => void;
  onLongPress?: (expense: Expense) => void;
}

export const ExpenseCard = memo(({
  item,
  expense,
  isLast = false,
  variant = 'row',
  onPress,
  onLongPress,
}: ExpenseCardProps) => {
  const expenseData = item || expense;
  if (!expenseData) return null;
  const isCredit = expenseData.category === 'Credit';
  const category = expenseData.category || 'Other';
  const { icon: Icon, color: iconColor, bg: iconBg } = getCategoryIcon(category);
  const isRow = variant === 'row';

  return (
    <Pressable
      onPress={() => onPress?.(expenseData)}
      onLongPress={() => onLongPress?.(expenseData)}
      style={({ pressed }) => [
        isRow ? styles.rowContainer : styles.standaloneContainer,
        isRow && !isLast && styles.borderBottom,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${expenseData.category}, ${expenseData.amount} rupees`}
    >
      {/* Category Icon */}
      <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
        <Icon
          size={moderateScale(22)}
          color={iconColor}
          strokeWidth={2.5}
        />
      </View>

      {/* Details (Category & Date/Notes) */}
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.category} numberOfLines={1}>
            {expenseData.title || expenseData.category}
          </Text>
          {expenseData.synced === false && (
            <View style={styles.unsyncedBadge}>
              <CloudOff size={moderateScale(12)} color={COLORS.gray} />
            </View>
          )}
        </View>
        <Text style={styles.date}>{expenseData.date}</Text>
      </View>

      {/* Amount */}
      <Text style={[styles.amount, isCredit && { color: COLORS.income }]}>
        {isCredit ? '+' : '-'} {formatCurrency(expenseData.amount)}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  rowContainer: {
    minHeight: moderateScale(70),
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(11),
  },
  standaloneContainer: {
    minHeight: moderateScale(76),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: moderateScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth * 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.07)',
  },
  iconWrapper: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  details: {
    flex: 1,
    marginLeft: moderateScale(12),
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  category: {
    color: COLORS.navy,
    fontSize: moderateScale(15),
    fontWeight: '800',
    marginBottom: moderateScale(2),
  },
  unsyncedBadge: {
    marginLeft: moderateScale(4),
    paddingHorizontal: moderateScale(4),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(4),
    backgroundColor: 'rgba(115, 130, 154, 0.1)',
  },
  date: {
    color: COLORS.gray,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  amount: {
    color: COLORS.expense,
    fontSize: moderateScale(15.5),
    fontWeight: '800',
    marginLeft: moderateScale(8),
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
});

export default ExpenseCard;
