import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowDownLeft, Wallet } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import NeuCard from './NeuCard';

export interface FinancialCardProps {
  type: 'income' | 'balance';
  amount: number;
  label?: string;
  customIcon?: React.ReactNode;
}

export const FinancialCard = memo(({
  type,
  amount,
  label,
  customIcon,
}: FinancialCardProps) => {
  const isIncome = type === 'income';
  const displayLabel = label || (isIncome ? 'Income' : 'Balance');
  const iconBgColor = isIncome ? COLORS.income : COLORS.expense;

  return (
    <NeuCard style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        {customIcon ? (
          customIcon
        ) : isIncome ? (
          <ArrowDownLeft
            size={moderateScale(24)}
            color={COLORS.white}
            strokeWidth={2.4}
          />
        ) : (
          <Wallet
            size={moderateScale(24)}
            color={COLORS.white}
            strokeWidth={2.2}
          />
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.label}>{displayLabel}</Text>
        <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
          {formatCurrency(amount)}
        </Text>
      </View>
    </NeuCard>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: SPACING.cardRadius,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  textContainer: {
    flex: 1,
    marginLeft: moderateScale(10),
  },
  label: {
    color: COLORS.gray,
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: moderateScale(3),
  },
  amount: {
    color: COLORS.navy,
    fontSize: moderateScale(19),
    fontWeight: '900',
    letterSpacing: -0.4,
  },
});

export default FinancialCard;
