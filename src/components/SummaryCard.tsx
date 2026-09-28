import React, { memo, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import {
  ArrowDownLeft,
  ChevronDown,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';

import {
  moderateScale,
} from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

/* =========================================================
   PROPS
========================================================= */

export interface SummaryCardProps {
  totalAmount: number;
  selectedPeriod?: string;
  trendPercentage?: number;
  incomeAmount?: any;
  balanceAmount?: number;
  expenseAmount?: number;
  onPeriodPress?: () => void;
  onIncomePress?: () => void;
  onBalancePress?: () => void;
}

/* =========================================================
   CONFIG
========================================================= */

const DEFAULT_TARGET_AMOUNT = 25000;
const CARD_HEIGHT = moderateScale(222);

interface CardTheme {
  isTargetReached: boolean;
  bgColors: string[];
  textColor: string;
  subtextColor: string;
  trendColor: string;
  pillBg: string;
  pillBorder: string;
  pillText: string;
  pillIcon: string;
  progressTrackBg: string;
  progressTrackBorder: string;
  progressFillColors: string[];
  progressTextColor: string;
  chartBarColor: string;
  chartBarOpacity: number;
  wave1Colors: [string, string];
  wave2Colors: [string, string];
  wave3Colors: [string, string];
  dividerColor: string;
  glassBg: string;
  glassBorder: string;
  metricLabelColor: string;
  metricValueColor: string;
  incomeIconBg: string;
  balanceIconBg: string;
  iconBorder: string;
}

const getCardTheme = (progress: number): CardTheme => {
  // 100%+ - Target Reached
  if (progress >= 1.0) {
    return {
      isTargetReached: true,
      bgColors: ['#FF4D5E', '#E62E43', '#CB1B32'],
      textColor: '#FFFFFF',
      subtextColor: 'rgba(255, 255, 255, 0.75)',
      trendColor: '#FFFFFF',
      pillBg: 'rgba(255, 255, 255, 0.22)',
      pillBorder: 'rgba(255, 255, 255, 0.38)',
      pillText: '#FFFFFF',
      pillIcon: '#FFFFFF',
      progressTrackBg: 'rgba(255, 255, 255, 0.22)',
      progressTrackBorder: 'rgba(255, 255, 255, 0.38)',
      progressFillColors: ['#FFFFFF', '#FFE4E6'],
      progressTextColor: '#FFFFFF',
      chartBarColor: '#FFFFFF',
      chartBarOpacity: 0.9,
      wave1Colors: ['#FF6B7A', '#F43F5E'],
      wave2Colors: ['#F43F5E', '#E11D48'],
      wave3Colors: ['#E11D48', '#BE123C'],
      dividerColor: 'rgba(255, 255, 255, 0.25)',
      glassBg: 'rgba(255, 255, 255, 0.18)',
      glassBorder: 'rgba(255, 255, 255, 0.32)',
      metricLabelColor: 'rgba(255, 255, 255, 0.85)',
      metricValueColor: '#FFFFFF',
      incomeIconBg: '#0A5C67',
      balanceIconBg: '#1E40AF',
      iconBorder: 'rgba(255, 255, 255, 0.3)',
    };
  }

  // 80% - Getting Close
  if (progress >= 0.7) {
    return {
      isTargetReached: false,
      bgColors: ['#FFF7F2', '#FFEAE5', '#FFD2CA'],
      textColor: '#0F172A',
      subtextColor: '#64748B',
      trendColor: '#E11D48',
      pillBg: 'rgba(255, 255, 255, 0.65)',
      pillBorder: 'rgba(255, 255, 255, 0.9)',
      pillText: '#0F172A',
      pillIcon: '#0F172A',
      progressTrackBg: 'rgba(255, 255, 255, 0.7)',
      progressTrackBorder: 'rgba(255, 255, 255, 0.95)',
      progressFillColors: ['#FB923C', '#EF4444'],
      progressTextColor: '#475569',
      chartBarColor: '#F87171',
      chartBarOpacity: 0.8,
      wave1Colors: ['#FED7AA', '#FECDD3'],
      wave2Colors: ['#FB923C', '#FDA4AF'],
      wave3Colors: ['#F87171', '#EF4444'],
      dividerColor: 'rgba(0, 0, 0, 0.08)',
      glassBg: 'rgba(255, 255, 255, 0.58)',
      glassBorder: 'rgba(255, 255, 255, 0.88)',
      metricLabelColor: '#475569',
      metricValueColor: '#0F172A',
      incomeIconBg: '#0A5C67',
      balanceIconBg: '#2563EB',
      iconBorder: 'transparent',
    };
  }

  // 50% - Halfway There
  if (progress >= 0.4) {
    return {
      isTargetReached: false,
      bgColors: ['#EDFAF4', '#FEF4E2', '#FEDEA8'],
      textColor: '#0F172A',
      subtextColor: '#64748B',
      trendColor: '#EA580C',
      pillBg: 'rgba(255, 255, 255, 0.65)',
      pillBorder: 'rgba(255, 255, 255, 0.9)',
      pillText: '#0F172A',
      pillIcon: '#0F172A',
      progressTrackBg: 'rgba(255, 255, 255, 0.7)',
      progressTrackBorder: 'rgba(255, 255, 255, 0.95)',
      progressFillColors: ['#FBBF24', '#F97316'],
      progressTextColor: '#475569',
      chartBarColor: '#FBBF24',
      chartBarOpacity: 0.8,
      wave1Colors: ['#FDE68A', '#FED7AA'],
      wave2Colors: ['#FCD34D', '#FB923C'],
      wave3Colors: ['#F59E0B', '#EA580C'],
      dividerColor: 'rgba(0, 0, 0, 0.08)',
      glassBg: 'rgba(255, 255, 255, 0.58)',
      glassBorder: 'rgba(255, 255, 255, 0.88)',
      metricLabelColor: '#475569',
      metricValueColor: '#0F172A',
      incomeIconBg: '#0A5C67',
      balanceIconBg: '#2563EB',
      iconBorder: 'transparent',
    };
  }

  // 25% - On Track
  if (progress >= 0.15) {
    return {
      isTargetReached: false,
      bgColors: ['#EBF9F3', '#FEF8EA', '#FDF0D0'],
      textColor: '#0F172A',
      subtextColor: '#64748B',
      trendColor: '#D97706',
      pillBg: 'rgba(255, 255, 255, 0.65)',
      pillBorder: 'rgba(255, 255, 255, 0.9)',
      pillText: '#0F172A',
      pillIcon: '#0F172A',
      progressTrackBg: 'rgba(255, 255, 255, 0.7)',
      progressTrackBorder: 'rgba(255, 255, 255, 0.95)',
      progressFillColors: ['#10B981', '#F59E0B'],
      progressTextColor: '#475569',
      chartBarColor: '#34D399',
      chartBarOpacity: 0.7,
      wave1Colors: ['#A7F3D0', '#FDE68A'],
      wave2Colors: ['#6EE7B7', '#FCD34D'],
      wave3Colors: ['#34D399', '#F59E0B'],
      dividerColor: 'rgba(0, 0, 0, 0.08)',
      glassBg: 'rgba(255, 255, 255, 0.58)',
      glassBorder: 'rgba(255, 255, 255, 0.88)',
      metricLabelColor: '#475569',
      metricValueColor: '#0F172A',
      incomeIconBg: '#0A5C67',
      balanceIconBg: '#2563EB',
      iconBorder: 'transparent',
    };
  }

  // 0% - Fresh Start
  return {
    isTargetReached: false,
    bgColors: ['#E8F8F5', '#D6F5EC', '#C2F2E3'],
    textColor: '#0F172A',
    subtextColor: '#64748B',
    trendColor: '#059669',
    pillBg: 'rgba(255, 255, 255, 0.65)',
    pillBorder: 'rgba(255, 255, 255, 0.9)',
    pillText: '#0F172A',
    pillIcon: '#0F172A',
    progressTrackBg: 'rgba(255, 255, 255, 0.7)',
    progressTrackBorder: 'rgba(255, 255, 255, 0.95)',
    progressFillColors: ['#34D399', '#10B981'],
    progressTextColor: '#475569',
    chartBarColor: '#34D399',
    chartBarOpacity: 0.65,
    wave1Colors: ['#D1FAE5', '#A7F3D0'],
    wave2Colors: ['#A7F3D0', '#6EE7B7'],
    wave3Colors: ['#6EE7B7', '#34D399'],
    dividerColor: 'rgba(0, 0, 0, 0.08)',
    glassBg: 'rgba(255, 255, 255, 0.58)',
    glassBorder: 'rgba(255, 255, 255, 0.88)',
    metricLabelColor: '#475569',
    metricValueColor: '#0F172A',
    incomeIconBg: '#0A5C67',
    balanceIconBg: '#2563EB',
    iconBorder: 'transparent',
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export const SummaryCard = memo(
  ({
    totalAmount,
    selectedPeriod = 'This Month',
    trendPercentage,
    incomeAmount,
    balanceAmount,
    onPeriodPress,
    onIncomePress,
    onBalancePress,
  }: SummaryCardProps) => {
    /* =====================================================
       METRICS CALCULATION
    ===================================================== */
    const currentTotal = typeof totalAmount === 'number' ? totalAmount : 0;
    const currentIncome = typeof incomeAmount === 'number' ? incomeAmount : 0;
    const currentBalance =
      typeof balanceAmount === 'number'
        ? balanceAmount
        : currentIncome - currentTotal;
    const effectiveTarget = incomeAmount > 0 ? incomeAmount : DEFAULT_TARGET_AMOUNT;

    const expenseProgress = useMemo(() => {
      if (currentTotal <= 0) {
        return 0;
      }
      return Math.min(currentTotal / effectiveTarget, 1);
    }, [currentTotal, effectiveTarget]);

    const percentageDisplay = useMemo(() => {
      if (trendPercentage !== undefined) {
        return trendPercentage;
      }
      return Math.round(expenseProgress * 100);
    }, [trendPercentage, expenseProgress]);

    const theme = useMemo(() => getCardTheme(expenseProgress), [expenseProgress]);

    const progressWidthPercent = `${Math.min(Math.round(expenseProgress * 100), 100)}%`;

    return (
      <View style={styles.card}>
        {/* =================================================
            BACKGROUND GRADIENT
        ================================================= */}
        <LinearGradient
          colors={theme.bgColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.absoluteFill}
        />

        {/* =================================================
            FLOWING ORGANIC WAVES
        ================================================= */}
        <View pointerEvents="none" style={styles.absoluteFill}>
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 400 220"
            preserveAspectRatio="none"
            style={styles.absoluteFill}
          >
            <Defs>
              <SvgLinearGradient id="wave1Grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={theme.wave1Colors[0]} stopOpacity={0.65} />
                <Stop offset="1" stopColor={theme.wave1Colors[1]} stopOpacity={0.85} />
              </SvgLinearGradient>
              <SvgLinearGradient id="wave2Grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={theme.wave2Colors[0]} stopOpacity={0.75} />
                <Stop offset="1" stopColor={theme.wave2Colors[1]} stopOpacity={0.9} />
              </SvgLinearGradient>
              <SvgLinearGradient id="wave3Grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={theme.wave3Colors[0]} stopOpacity={0.85} />
                <Stop offset="1" stopColor={theme.wave3Colors[1]} stopOpacity={1} />
              </SvgLinearGradient>
            </Defs>

            {/* Back wave layer */}
            <Path
              d="M0,120 C100,80 180,150 270,105 C335,70 375,95 400,80 L400,220 L0,220 Z"
              fill="url(#wave1Grad)"
            />

            {/* Mid wave layer */}
            <Path
              d="M0,148 C90,115 185,165 275,130 C340,98 375,120 400,108 L400,220 L0,220 Z"
              fill="url(#wave2Grad)"
            />

            {/* Front wave layer */}
            <Path
              d="M0,175 C100,148 190,182 280,155 C345,130 380,142 400,135 L400,220 L0,220 Z"
              fill="url(#wave3Grad)"
            />
          </Svg>
        </View>

        {/* =================================================
            CARD CONTENT
        ================================================= */}
        <View style={styles.cardContainer}>
          {/* Top Section */}
          <View>
            {/* Top Row: Title + Period Pill */}
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: theme.textColor }]}>
                Total Expenses
              </Text>

              <Pressable
                onPress={onPeriodPress}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.periodSelector,
                  {
                    backgroundColor: theme.pillBg,
                    borderColor: theme.pillBorder,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.periodText, { color: theme.pillText }]}>
                  {selectedPeriod}
                </Text>

                <ChevronDown
                  size={moderateScale(15)}
                  color={theme.pillIcon}
                  strokeWidth={2.5}
                />
              </Pressable>
            </View>

            {/* Middle Row: Amount & Target + Trend */}
            <View style={styles.middleRow}>
              <View style={styles.amountContainer}>
                <Text
                  style={[styles.amountText, { color: theme.textColor }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatCurrency(currentTotal)}
                </Text>

                <Text style={[styles.targetText, { color: theme.subtextColor }]}>
                  / {formatCurrency(effectiveTarget)}
                </Text>
              </View>

              <View style={styles.trendContainer}>
                <TrendingUp
                  size={moderateScale(18)}
                  color={theme.trendColor}
                  strokeWidth={2.8}
                />
                <Text style={[styles.trendText, { color: theme.trendColor }]}>
                  {percentageDisplay}%
                </Text>
              </View>
            </View>

            {/* Progress Row: Progress Bar + Mini Bars */}
            <View style={styles.progressRow}>
              {/* Progress Bar & Label */}
              <View style={styles.progressSection}>
                <View
                  style={[
                    styles.progressTrack,
                    {
                      backgroundColor: theme.progressTrackBg,
                      borderColor: theme.progressTrackBorder,
                    },
                  ]}
                >
                  {expenseProgress > 0 && (
                    <View
                      style={[
                        styles.progressFill,
                        { width: progressWidthPercent as any },
                      ]}
                    >
                      <LinearGradient
                        colors={theme.progressFillColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.absoluteFill}
                      />
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.progressPercentText,
                    { color: theme.progressTextColor },
                  ]}
                >
                  {Math.round(expenseProgress * 100)}%
                </Text>
              </View>

              {/* Mini Chart Bars */}
              <View style={styles.chartBars}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: moderateScale(13),
                      backgroundColor: theme.chartBarColor,
                      opacity: theme.chartBarOpacity,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: moderateScale(22),
                      backgroundColor: theme.chartBarColor,
                      opacity: theme.chartBarOpacity,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: moderateScale(32),
                      backgroundColor: theme.chartBarColor,
                      opacity: theme.chartBarOpacity,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* =================================================
              BOTTOM INCOME & BALANCE (GLASS CARD)
          ================================================= */}
          <View style={styles.footerSection}>
            <View
              style={[
                styles.glassCard,
                {
                  backgroundColor: theme.glassBg,
                  borderColor: theme.glassBorder,
                },
              ]}
            >
              {/* Income Metric */}
              <Pressable
                onPress={onIncomePress}
                style={({ pressed }) => [
                  styles.metricItem,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.metricIconBox,
                    {
                      backgroundColor: theme.incomeIconBg,
                      borderColor: theme.iconBorder,
                    },
                  ]}
                >
                  <ArrowDownLeft
                    size={moderateScale(19)}
                    color="#FFFFFF"
                    strokeWidth={2.6}
                  />
                </View>

                <View style={styles.metricTexts}>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: theme.metricLabelColor },
                    ]}
                  >
                    Income
                  </Text>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: theme.metricValueColor },
                    ]}
                    numberOfLines={1}
                  >
                    + {formatCurrency(currentIncome)}
                  </Text>
                </View>
              </Pressable>

              {/* Vertical Divider */}
              <View
                style={[
                  styles.verticalDivider,
                  { backgroundColor: theme.dividerColor },
                ]}
              />

              {/* Balance Metric */}
              <Pressable
                onPress={onBalancePress}
                style={({ pressed }) => [
                  styles.metricItem,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.metricIconBox,
                    {
                      backgroundColor: theme.balanceIconBg,
                      borderColor: theme.iconBorder,
                    },
                  ]}
                >
                  <Wallet
                    size={moderateScale(18)}
                    color="#FFFFFF"
                    strokeWidth={2.4}
                  />
                </View>

                <View style={styles.metricTexts}>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: theme.metricLabelColor },
                    ]}
                  >
                    Balance
                  </Text>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: theme.metricValueColor },
                    ]}
                    numberOfLines={1}
                  >
                    {formatCurrency(currentBalance)}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: moderateScale(22),
    marginBottom: moderateScale(16),
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  absoluteFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  cardContainer: {
    flex: 1,
    paddingHorizontal: moderateScale(18),
    paddingTop: moderateScale(14),
    paddingBottom: moderateScale(12),
    justifyContent: 'space-between',
    zIndex: 10,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  periodSelector: {
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    borderWidth: 1,
  },

  periodText: {
    fontSize: moderateScale(12.5),
    fontWeight: '600',
  },

  /* Middle Row */
  middleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: moderateScale(2),
  },

  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexShrink: 1,
  },

  amountText: {
    fontSize: moderateScale(26),
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  targetText: {
    fontSize: moderateScale(12.5),
    fontWeight: '600',
    marginLeft: moderateScale(4),
  },

  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(3),
  },

  trendText: {
    fontSize: moderateScale(15),
    fontWeight: '800',
  },

  /* Progress Row */
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: moderateScale(4),
  },

  progressSection: {
    flex: 1,
    marginRight: moderateScale(22),
  },

  progressTrack: {
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    borderWidth: 1,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },

  progressPercentText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginTop: moderateScale(3),
  },

  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: moderateScale(5),
    height: moderateScale(32),
  },

  chartBar: {
    width: moderateScale(6),
    borderRadius: moderateScale(3),
  },

  /* Footer: Income & Balance Glass Card */
  footerSection: {
    marginTop: moderateScale(4),
  },

  glassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    borderWidth: 1,
    shadowColor: '#a5a5a5ff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },

  metricIconBox: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },

  metricTexts: {
    flex: 1,
  },

  metricLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },

  metricValue: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    marginTop: moderateScale(1),
  },

  verticalDivider: {
    width: StyleSheet.hairlineWidth * 1.5,
    height: moderateScale(26),
    marginHorizontal: moderateScale(8),
  },

  pressed: {
    opacity: 0.7,
  },
});

export default SummaryCard;