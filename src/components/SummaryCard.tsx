import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View, } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronDown, TrendingUp } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

export interface SummaryCardProps {
  totalAmount: number;
  selectedPeriod?: string;
  trendPercentage?: number;
  onPeriodPress?: () => void;
}

export const SummaryCard = memo(({
  totalAmount,
  selectedPeriod = 'This Month',
  trendPercentage = 12,
  onPeriodPress,
}: SummaryCardProps) => {
  return (
    <LinearGradient
      colors={COLORS.gradientPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Top row: Title and Month Selector */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Total Expenses</Text>

        <Pressable
          onPress={onPeriodPress}
          hitSlop={6}
          style={({ pressed }) => [
            styles.periodSelector,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.periodText}>{selectedPeriod}</Text>
          <ChevronDown
            size={moderateScale(18)}
            color={COLORS.white}
            strokeWidth={2.5}
          />
        </Pressable>
      </View>

      {/* Bottom row: Total Amount, Trend, Micro Chart */}
      <View style={styles.bottomRow}>
        <Text style={styles.amountText} numberOfLines={1} adjustsFontSizeToFit>
          {formatCurrency(totalAmount)}
        </Text>

        <View style={styles.trendContainer}>
          <TrendingUp
            size={moderateScale(22)}
            color="#FF5061"
            strokeWidth={3}
          />
          <Text style={styles.trendText}>{trendPercentage}%</Text>
        </View>

        <View style={styles.chartBars}>
          <View style={[styles.chartBar, { height: moderateScale(16) }]} />
          <View style={[styles.chartBar, { height: moderateScale(28) }]} />
          <View style={[styles.chartBar, { height: moderateScale(40) }]} />
        </View>
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  card: {
    minHeight: moderateScale(155),
    borderRadius: SPACING.cardRadius,
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(18),
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...SHADOWS.medium,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.white,
    fontSize: moderateScale(17),
    fontWeight: '700',
  },
  periodSelector: {
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    paddingHorizontal: moderateScale(13),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  periodText: {
    color: COLORS.white,
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(10),
  },
  amountText: {
    color: COLORS.white,
    fontSize: moderateScale(32),
    fontWeight: '900',
    letterSpacing: -1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: moderateScale(14),
    gap: moderateScale(2),
  },
  trendText: {
    color: '#FF5262',
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  chartBars: {
    marginLeft: 'auto',
    height: moderateScale(42),
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: moderateScale(6),
  },
  chartBar: {
    width: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: COLORS.accent,
    opacity: 0.9,
  },
  pressed: {
    opacity: 0.75,
  },
});

export default SummaryCard;
