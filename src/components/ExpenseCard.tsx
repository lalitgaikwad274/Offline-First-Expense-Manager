import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Car, CloudOff, CreditCard, HeartPulse, Package, Plane, ShoppingBag, Utensils, Zap } from 'lucide-react-native';
import { Expense, ExpenseCategory } from '../types/expense';
import { COLORS, moderateScale } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

export interface ExpenseCardProps {
  item?: Expense;
  expense?: Expense;
  isLast?: boolean;
  onPress?: (expense: Expense) => void;
  onLongPress?: (expense: Expense) => void;
}

const getCategoryIcon = (category: ExpenseCategory) => {
  switch (category) {
    case 'Food & Dining':
      return Utensils;
    case 'Transport':
      return Car;
    case 'Shopping':
      return ShoppingBag;
    case 'Bills & Utilities':
      return Zap;
    case 'Entertainment':
      return CreditCard;
    case 'Health':
      return HeartPulse;
    case 'Travel':
      return Plane;
    default:
      return Package;
  }
};

const getCategoryColor = (category: ExpenseCategory): string => {
  switch (category) {
    case 'Food & Dining':
      return COLORS.expense;
    case 'Transport':
      return COLORS.info;
    case 'Shopping':
      return COLORS.warning;
    case 'Bills & Utilities':
      return '#8B5CF6';
    case 'Health':
      return COLORS.income;
    case 'Travel':
      return '#EC4899';
    default:
      return COLORS.primary;
  }
};

export const ExpenseCard = memo(({
  item,
  expense,
  isLast = false,
  onPress,
  onLongPress,
}: ExpenseCardProps) => {
  const expenseData = item || expense;
  if (!expenseData) return null;

  const Icon = getCategoryIcon(expenseData.category);
  const iconColor = expenseData.color || getCategoryColor(expenseData.category);

  return (
    <Pressable
      onPress={() => onPress?.(expenseData)}
      onLongPress={() => onLongPress?.(expenseData)}
      style={({ pressed }) => [
        styles.container,
        !isLast && styles.borderBottom,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${expenseData.category}, ${expenseData.amount} rupees`}
    >
      {/* Category Icon */}
      <View style={[styles.iconWrapper, { backgroundColor: iconColor }]}>
        <Icon
          size={moderateScale(24)}
          color={COLORS.white}
          strokeWidth={2.2}
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
      <Text style={styles.amount}>
        - {formatCurrency(expenseData.amount)}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: moderateScale(84),
    backgroundColor: COLORS.surfaceCard,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  iconWrapper: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: moderateScale(16),
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
    fontSize: moderateScale(16),
    fontWeight: '800',
    marginLeft: moderateScale(8),
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: 'rgba(235, 252, 253, 0.95)',
  },
});

export default ExpenseCard;
