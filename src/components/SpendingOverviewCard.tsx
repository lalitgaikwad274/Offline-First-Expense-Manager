import React, { memo, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { Check, ChevronRight, X } from 'lucide-react-native';

import { COLORS, moderateScale, SHADOWS } from '../utils/constants';
import { useAppSelector } from '../store';
import { SpendingOverviewSkeleton } from './Shimmer';

export type SpendingPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface PeriodMeta {
  id: SpendingPeriod;
  label: string;
  selectorText: string;
  subtitle: string;
  tags: string[];
}

const PERIOD_METAS: Record<SpendingPeriod, PeriodMeta> = {
  weekly: {
    id: 'weekly',
    label: 'Weekly',
    selectorText: 'This week',
    subtitle: 'SPENT THIS WEEK',
    tags: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    selectorText: 'This month',
    subtitle: 'SPENT THIS MONTH',
    tags: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  },
  quarterly: {
    id: 'quarterly',
    label: 'Quarterly',
    selectorText: 'This quarter',
    subtitle: 'SPENT THIS QUARTER',
    tags: ['M1', 'M2', 'M3'],
  },
  yearly: {
    id: 'yearly',
    label: 'Yearly',
    selectorText: 'This year',
    subtitle: 'SPENT THIS YEAR',
    tags: ['Q1', 'Q2', 'Q3', 'Q4'],
  },
};

export const parseExpenseDate = (dateInput?: string | number | Date | null): Date => {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? new Date() : dateInput;
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  const str = String(dateInput).trim();
  const now = new Date();

  if (str.startsWith('Today')) {
    return now;
  }
  if (str.startsWith('Yesterday')) {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return y;
  }

  const match = str.match(/^(\d{1,2})\s+([A-Za-z]{3})(?:\s+(\d{4}))?/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = monthNames.indexOf(match[2].toLowerCase());
    if (month !== -1) {
      const year = match[3] ? parseInt(match[3], 10) : now.getFullYear();
      return new Date(year, month, day);
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return now;
};

export const formatTierLabel = (val: number): string => {
  if (val <= 0) return '₹0';
  if (val >= 10000000) {
    const cr = val / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(1)}Cr`;
  }
  if (val >= 100000) {
    const l = val / 100000;
    if (l % 1 === 0) return `₹${l}L`;
    const k = val / 1000;
    return `₹${Math.round(k)}k`;
  }
  if (val >= 1000) {
    const k = val / 1000;
    return `₹${k % 1 === 0 ? k : k.toFixed(1)}k`;
  }
  return `₹${Math.round(val)}`;
};

export const getCleanCeiling = (
  amount: number
): {
  topVal: number;
  midVal: number;
  tierLabels: [string, string, string];
} => {
  const safeAmount = Math.max(amount, 100);
  const targetTop = safeAmount * 1.25;

  const magnitude = Math.pow(10, Math.floor(Math.log10(targetTop)));
  const normalized = targetTop / magnitude;

  const niceSteps = [1.2, 1.6, 2.0, 2.4, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0];
  let step = 10.0;
  for (const s of niceSteps) {
    if (normalized <= s) {
      step = s;
      break;
    }
  }

  const topVal = Math.round(step * magnitude);
  const midVal = Math.round(topVal / 2);

  return {
    topVal,
    midVal,
    tierLabels: [formatTierLabel(topVal), formatTierLabel(midVal), '₹0'],
  };
};

const getSmoothPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return path;
};

const getAreaPath = (points: { x: number; y: number }[], baselineY: number): string => {
  const linePath = getSmoothPath(points);
  if (!linePath || points.length === 0) return '';
  const lastX = points[points.length - 1].x;
  const firstX = points[0].x;
  return `${linePath} L ${lastX.toFixed(1)},${baselineY} L ${firstX.toFixed(1)},${baselineY} Z`;
};

export interface SpendingOverviewCardProps {
  isLoading?: boolean;
}

export const SpendingOverviewCard: React.FC<SpendingOverviewCardProps> = memo(({
  isLoading: propIsLoading,
}) => {
  const reduxIsLoading = useAppSelector(state => state.expense.isLoading);
  const isLoading = propIsLoading !== undefined ? propIsLoading : reduxIsLoading;

  const expenses = useAppSelector(state => state.expense.expenses);

  const [period, setPeriod] = useState<SpendingPeriod>('monthly');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [chartWidth, setChartWidth] = useState(250);

  const currentMeta = PERIOD_METAS[period];

  // 1. Filter expenses according to selected period
  const filteredExpenses = useMemo(() => {
    const now = new Date();

    return expenses.filter(item => {
      const d = parseExpenseDate(item.date);

      if (period === 'weekly') {
        const monday = new Date(now);
        const day = monday.getDay();
        const diffToMon = (day === 0 ? -6 : 1) - day;
        monday.setDate(monday.getDate() + diffToMon);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return d >= monday && d <= sunday;
      } else if (period === 'monthly') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (period === 'quarterly') {
        const curQ = Math.floor(now.getMonth() / 3);
        const itemQ = Math.floor(d.getMonth() / 3);
        return curQ === itemQ && d.getFullYear() === now.getFullYear();
      } else {
        // yearly
        return d.getFullYear() === now.getFullYear();
      }
    });
  }, [expenses, period]);

  // 2. Real total spend calculated purely from actual filtered expenses (net of credit settlements)
  const periodTotal = useMemo(() => {
    return Math.max(0, filteredExpenses.reduce((sum, item) => sum + (item.category === 'Credit' ? -Number(item.amount) : Number(item.amount) || 0), 0));
  }, [filteredExpenses]);

  // 3. Dynamic active tag index based on current real-time date
  const now = new Date();
  const tags = currentMeta.tags;
  const isWeekOrMonth = period === 'weekly' || period === 'monthly';

  const defaultActiveIndex = useMemo(() => {
    if (isWeekOrMonth) {
      return (now.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
    }
    if (period === 'quarterly') {
      return now.getMonth() % 3; // 0, 1, or 2
    }
    return Math.min(Math.floor(now.getMonth() / 3), 3); // 0, 1, 2, 3
  }, [isWeekOrMonth, period]);

  const activeIndex = selectedPointIndex !== null ? selectedPointIndex : defaultActiveIndex;

  // Chart layout geometry
  const chartHeight = moderateScale(110);
  const baselineY = chartHeight - moderateScale(10);
  const topY = moderateScale(12);
  const midY = (baselineY + topY) / 2;

  // Dynamic Y-axis ceiling based on actual spend
  const { topVal, midVal, tierLabels } = useMemo(() => {
    return getCleanCeiling(periodTotal);
  }, [periodTotal]);

  // Compute SVG Points based on actual expense buckets
  const points = useMemo(() => {
    const count = tags.length;
    const bucketTotals = new Array(count).fill(0);

    filteredExpenses.forEach(exp => {
      const d = parseExpenseDate(exp.date);
      if (isWeekOrMonth) {
        const dayIdx = (d.getDay() + 6) % 7;
        bucketTotals[dayIdx] += Number(exp.amount) || 0;
      } else if (period === 'quarterly') {
        const mIdx = d.getMonth() % 3;
        bucketTotals[mIdx] += Number(exp.amount) || 0;
      } else {
        const qIdx = Math.min(Math.floor(d.getMonth() / 3), 3);
        bucketTotals[qIdx] += Number(exp.amount) || 0;
      }
    });

    const curveValues: number[] = [];
    let running = 0;
    for (let i = 0; i < count; i++) {
      if (i <= defaultActiveIndex) {
        running += bucketTotals[i];
        const progressiveFloor =
          periodTotal * (0.15 + 0.85 * (defaultActiveIndex > 0 ? i / defaultActiveIndex : 1));
        curveValues.push(periodTotal > 0 ? (running > 0 ? running : Math.round(progressiveFloor)) : 0);
      } else {
        curveValues.push(periodTotal);
      }
    }

    if (periodTotal > 0) {
      curveValues[defaultActiveIndex] = periodTotal;
    }

    return curveValues.map((val, idx) => {
      const x = count > 1 ? (idx / (count - 1)) * chartWidth : chartWidth / 2;
      const normalizedRatio = topVal > 0 ? Math.min(Math.max(val / topVal, 0), 1) : 0;
      const y = baselineY - normalizedRatio * (baselineY - topY);
      return { x, y, value: val };
    });
  }, [
    tags.length,
    filteredExpenses,
    isWeekOrMonth,
    period,
    defaultActiveIndex,
    periodTotal,
    chartWidth,
    topVal,
    baselineY,
    topY,
  ]);

  const linePath = useMemo(() => getSmoothPath(points), [points]);
  const areaPath = useMemo(() => getAreaPath(points, baselineY), [points, baselineY]);

  const activePoint = points[Math.min(activeIndex, points.length - 1)] || {
    x: chartWidth * 0.8,
    y: baselineY,
    value: 0,
  };

  const activeAmount = useMemo(() => {
    if (selectedPointIndex !== null && points[selectedPointIndex]) {
      return points[selectedPointIndex].value;
    }
    return periodTotal;
  }, [selectedPointIndex, points, periodTotal]);

  const formattedAmount = useMemo(() => {
    return `₹${activeAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [activeAmount]);

  const handleTagPress = (idx: number) => {
    if (selectedPointIndex === idx) {
      setSelectedPointIndex(null);
    } else {
      setSelectedPointIndex(idx);
    }
  };

  const handleSelectPeriod = (newPeriod: SpendingPeriod) => {
    setPeriod(newPeriod);
    setSelectedPointIndex(null);
    setModalVisible(false);
  };

  if (isLoading) {
    return <SpendingOverviewSkeleton />;
  }

  return (
    <View style={styles.outerContainer}>
      {/* 1. Header with title and period dropdown selector */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Spending Overview</Text>

        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Change period. Currently ${currentMeta.label}`}
        >
          <Text style={styles.selectorText}>{currentMeta.selectorText}</Text>
          <ChevronRight
            size={moderateScale(16)}
            color={COLORS.petrol}
            strokeWidth={2.4}
          />
        </TouchableOpacity>
      </View>

      {/* 2. Elevated Main Card */}
      <View style={styles.card}>
        {/* Top Metric Header */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.amountContainer}>
            <Text style={styles.cardSubtitle}>{currentMeta.subtitle}</Text>
            <Text style={styles.amountText}>{formattedAmount}</Text>
          </View>
        </View>

        {/* Chart View with Y-Axis and Smooth Wave SVG */}
        <View style={styles.chartWrapper}>
          {/* Y-Axis Column */}
          <View style={styles.yAxisColumn}>
            <Text style={styles.yAxisText}>{tierLabels[0]}</Text>
            <Text style={styles.yAxisText}>{tierLabels[1]}</Text>
            <Text style={styles.yAxisText}>{tierLabels[2]}</Text>
          </View>

          {/* SVG Chart Area */}
          <View
            style={styles.svgContainer}
            onLayout={e => {
              const width = e.nativeEvent.layout.width;
              if (width > 50 && Math.abs(width - chartWidth) > 2) {
                setChartWidth(width);
              }
            }}
          >
            <Svg width={chartWidth} height={chartHeight}>
              <Defs>
                <SvgLinearGradient id="chartAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0B5563" stopOpacity={0.16} />
                  <Stop offset="80%" stopColor="#0B5563" stopOpacity={0.04} />
                  <Stop offset="100%" stopColor="#0B5563" stopOpacity={0.00} />
                </SvgLinearGradient>
              </Defs>

              {/* Dotted Horizontal Gridlines */}
              <Line
                x1={0}
                y1={topY}
                x2={chartWidth}
                y2={topY}
                stroke="rgba(195, 218, 222, 0.75)"
                strokeWidth={1.5}
                strokeDasharray="3, 5"
              />
              <Line
                x1={0}
                y1={midY}
                x2={chartWidth}
                y2={midY}
                stroke="rgba(195, 218, 222, 0.75)"
                strokeWidth={1.5}
                strokeDasharray="3, 5"
              />
              <Line
                x1={0}
                y1={baselineY}
                x2={chartWidth}
                y2={baselineY}
                stroke="rgba(195, 218, 222, 0.75)"
                strokeWidth={1.5}
                strokeDasharray="3, 5"
              />

              {/* Smooth Area Gradient Fill */}
              {areaPath ? (
                <Path d={areaPath} fill="url(#chartAreaGradient)" />
              ) : null}

              {/* Wave Spline Line */}
              {linePath ? (
                <Path
                  d={linePath}
                  fill="none"
                  stroke="#0B5563"
                  strokeWidth={moderateScale(3.2)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

              {/* Active Dot with Red Ring and White Center */}
              {activePoint ? (
                <>
                  <Circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r={moderateScale(7.5)}
                    fill="rgba(255, 30, 79, 0.18)"
                  />
                  <Circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r={moderateScale(5.2)}
                    stroke="#FF1E4F"
                    strokeWidth={moderateScale(3)}
                    fill="#FFFFFF"
                  />
                </>
              ) : null}
            </Svg>
          </View>
        </View>

        {/* X-Axis Tag Labels Row */}
        <View style={styles.xAxisRow}>
          {currentMeta.tags.map((tag, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <TouchableOpacity
                key={`${tag}-${idx}`}
                onPress={() => handleTagPress(idx)}
                style={[styles.xTag, isSelected && styles.xTagActive]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`View data for ${tag}`}
              >
                <Text style={[styles.xTagText, isSelected && styles.xTagTextActive]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Period Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Spending Period</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={moderateScale(18)} color={COLORS.navy} />
              </TouchableOpacity>
            </View>

            {(['weekly', 'monthly', 'quarterly', 'yearly'] as SpendingPeriod[]).map(p => {
              const item = PERIOD_METAS[p];
              const isSelected = period === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.modalItem, isSelected && styles.modalItemActive]}
                  onPress={() => handleSelectPeriod(p)}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text
                      style={[
                        styles.modalItemLabel,
                        isSelected && styles.modalItemLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.modalItemSubtitle}>{item.selectorText}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Check
                        size={moderateScale(15)}
                        color={COLORS.white}
                        strokeWidth={2.8}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

export default SpendingOverviewCard;

const styles = StyleSheet.create({
  outerContainer: {
    marginTop: moderateScale(16),
    marginBottom: moderateScale(6),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.3,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(4),
    paddingHorizontal: moderateScale(6),
    borderRadius: moderateScale(8),
    gap: moderateScale(1),
  },
  selectorText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.petrol,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    borderWidth: 1.5,
    borderColor: 'rgba(219, 237, 240, 0.75)',
    shadowColor: '#0E3940',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: moderateScale(14),
  },
  amountContainer: {
    flex: 1,
  },
  cardSubtitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  amountText: {
    fontSize: moderateScale(28),
    fontWeight: '900',
    color: COLORS.navy,
    marginTop: moderateScale(3),
    letterSpacing: -0.5,
  },
  percentageBadge: {
    backgroundColor: '#D4F6ED',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4.5),
    borderRadius: moderateScale(11),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: moderateScale(8),
  },
  percentageText: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    color: '#0F7E66',
    letterSpacing: -0.2,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: moderateScale(110),
    marginTop: moderateScale(2),
  },
  yAxisColumn: {
    width: moderateScale(36),
    height: moderateScale(110),
    justifyContent: 'space-between',
    paddingBottom: moderateScale(10),
    paddingTop: moderateScale(4),
  },
  yAxisText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#8A9FA8',
  },
  svgContainer: {
    flex: 1,
    height: moderateScale(110),
    justifyContent: 'center',
  },
  xAxisRow: {
    flexDirection: 'row',
    marginLeft: moderateScale(36),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(2),
    marginTop: moderateScale(10),
  },
  xTag: {
    width: moderateScale(19),
    height: moderateScale(19),
    borderRadius: moderateScale(3.5),
    backgroundColor: '#E6EFF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xTagActive: {
    backgroundColor: '#D0E3E7',
    transform: [{ scale: 1.1 }],
  },
  xTagText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#4B5D68',
  },
  xTagTextActive: {
    color: COLORS.petrol,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 20, 43, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
  modalCard: {
    width: '100%',
    maxWidth: moderateScale(340),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(22),
    padding: moderateScale(18),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.9)',
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(14),
    paddingBottom: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(219, 237, 240, 0.6)',
  },
  modalTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: COLORS.navy,
  },
  modalCloseButton: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    backgroundColor: 'rgba(219, 245, 248, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(14),
    marginBottom: moderateScale(6),
  },
  modalItemActive: {
    backgroundColor: 'rgba(219, 245, 248, 0.65)',
  },
  modalItemLabel: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },
  modalItemLabelActive: {
    color: COLORS.petrol,
  },
  modalItemSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    marginTop: moderateScale(1),
  },
  checkBadge: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.petrol,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
