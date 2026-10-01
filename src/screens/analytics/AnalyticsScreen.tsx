import React, { memo, useMemo, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
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
import { AlertCircle, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { COLORS, moderateScale, SHADOWS } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import { getCategoryColor } from '../../utils/helpers';
import { useAppSelector } from '../../store';
import BottomNavigation from '../../components/BottomNavigation';
import { SpendingOverviewSkeleton, SummaryCardSkeleton } from '../../components/Shimmer';

export type AnalyticsPeriod = 'week' | 'month' | 'year';

interface CategoryData {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#FF0033',
  Transport: '#085866',
  Shopping: '#5D7588',
  'Bills & Utilities': '#3DD5C3',
  Entertainment: '#845EF7',
  Health: '#F06595',
  Travel: '#20C997',
  'mutual funds': '#FF6B6B',
  Loans: '#F59E0B',
  Other: '#868E96',
};

const formatCurrency = (val: number): string => {
  return `₹${val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

export const AnalyticsScreen: React.FC = memo(() => {
  const navigation = useNavigation<any>();
  const expenses = useAppSelector(state => state.expense.expenses);
  const isLoading = useAppSelector(state => state.expense.isLoading);

  const [period, setPeriod] = useState<AnalyticsPeriod>('month');
  const [chartWidth, setChartWidth] = useState(250);

  // 1. Filter expenses according to selected period
  const { currentExpenses, previousExpenses } = useMemo(() => {
    const debits = expenses.filter(item => item.category !== 'Credit');
    const now = new Date();

    const curList: typeof debits = [];
    const prevList: typeof debits = [];

    debits.forEach(item => {
      const d = parseExpenseDate(item.date);

      if (period === 'week') {
        const monday = new Date(now);
        const day = monday.getDay();
        const diffToMon = (day === 0 ? -6 : 1) - day;
        monday.setDate(monday.getDate() + diffToMon);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const prevMonday = new Date(monday);
        prevMonday.setDate(prevMonday.getDate() - 7);
        const prevSunday = new Date(sunday);
        prevSunday.setDate(prevSunday.getDate() - 7);

        if (d >= monday && d <= sunday) {
          curList.push(item);
        } else if (d >= prevMonday && d <= prevSunday) {
          prevList.push(item);
        }
      } else if (period === 'month') {
        const isCurMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const isPrevMonth =
          d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear();

        if (isCurMonth) {
          curList.push(item);
        } else if (isPrevMonth) {
          prevList.push(item);
        }
      } else {
        // year
        const isCurYear = d.getFullYear() === now.getFullYear();
        const isPrevYear = d.getFullYear() === now.getFullYear() - 1;

        if (isCurYear) {
          curList.push(item);
        } else if (isPrevYear) {
          prevList.push(item);
        }
      }
    });

    return { currentExpenses: curList, previousExpenses: prevList };
  }, [expenses, period]);

  // 2. Total spending calculations (net of credit settlements)
  const totalSpending = useMemo(() => {
    return Math.max(0, currentExpenses.reduce((sum, item) => sum + (item.category === 'Credit' ? -Number(item.amount) : Number(item.amount) || 0), 0));
  }, [currentExpenses]);

  const prevTotalSpending = useMemo(() => {
    return Math.max(0, previousExpenses.reduce((sum, item) => sum + (item.category === 'Credit' ? -Number(item.amount) : Number(item.amount) || 0), 0));
  }, [previousExpenses]);

  const { percentageChangeText, isDecrease, vsText } = useMemo(() => {
    const periodLabel = period === 'week' ? 'last week' : period === 'month' ? 'last month' : 'last year';

    if (prevTotalSpending > 0) {
      const diff = totalSpending - prevTotalSpending;
      const pct = Math.abs(Math.round((diff / prevTotalSpending) * 100));
      return {
        percentageChangeText: `${diff <= 0 ? '-' : '+'}${pct}%`,
        isDecrease: diff <= 0,
        vsText: `vs ${formatCurrency(prevTotalSpending)} ${periodLabel}`,
      };
    }

    return {
      percentageChangeText: '0%',
      isDecrease: true,
      vsText: `vs ₹0.00 ${periodLabel}`,
    };
  }, [totalSpending, prevTotalSpending, period]);

  // 3. Category breakdown calculation
  const categories: CategoryData[] = useMemo(() => {
    if (totalSpending === 0 || currentExpenses.length === 0) return [];

    const map: Record<string, number> = {};
    currentExpenses.forEach(item => {
      const cat = item.category || 'Other';
      map[cat] = (map[cat] || 0) + (Number(item.amount) || 0);
    });

    const list = Object.entries(map).map(([name, amount], idx) => {
      const pct = Math.round((amount / totalSpending) * 100);
      return {
        id: `${name}-${idx}`,
        name,
        amount,
        percentage: pct,
        color: CATEGORY_COLORS[name] || getCategoryColor(name),
      };
    });

    list.sort((a, b) => b.amount - a.amount);

    // Adjust rounding difference so total equals exactly 100%
    const sumPct = list.reduce((acc, c) => acc + c.percentage, 0);
    if (list.length > 0 && sumPct !== 100) {
      list[0].percentage += 100 - sumPct;
    }

    return list;
  }, [currentExpenses, totalSpending]);

  // 4. Dynamic chart tags and curve points
  const now = new Date();
  const isWeekOrMonth = period === 'week' || period === 'month';
  const tags = isWeekOrMonth ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['Q1', 'Q2', 'Q3', 'Q4'];
  const activeTagIndex = isWeekOrMonth
    ? (now.getDay() + 6) % 7
    : Math.min(Math.floor(now.getMonth() / 3), 3);

  const { topVal, tierLabels } = useMemo(() => {
    return getCleanCeiling(totalSpending);
  }, [totalSpending]);

  const chartHeight = moderateScale(110);
  const baselineY = chartHeight - moderateScale(10);
  const topY = moderateScale(12);
  const midY = (baselineY + topY) / 2;

  const points = useMemo(() => {
    if (totalSpending === 0) return [];

    const count = tags.length;
    const bucketTotals = new Array(count).fill(0);

    currentExpenses.forEach(exp => {
      const d = parseExpenseDate(exp.date);
      if (isWeekOrMonth) {
        const dayIdx = (d.getDay() + 6) % 7;
        bucketTotals[dayIdx] += Number(exp.amount) || 0;
      } else {
        const qIdx = Math.min(Math.floor(d.getMonth() / 3), 3);
        bucketTotals[qIdx] += Number(exp.amount) || 0;
      }
    });

    const curveValues: number[] = [];
    let runningSum = 0;
    for (let i = 0; i < count; i++) {
      if (i <= activeTagIndex) {
        runningSum += bucketTotals[i];
        const progressiveFloor = totalSpending * (0.15 + 0.85 * (activeTagIndex > 0 ? i / activeTagIndex : 1));
        curveValues.push(runningSum > 0 ? runningSum : Math.round(progressiveFloor));
      } else {
        curveValues.push(totalSpending);
      }
    }
    curveValues[activeTagIndex] = totalSpending;

    return curveValues.map((val, idx) => {
      const x = count > 1 ? (idx / (count - 1)) * chartWidth : chartWidth / 2;
      const normalizedRatio = topVal > 0 ? Math.min(Math.max(val / topVal, 0), 1) : 0;
      const y = baselineY - normalizedRatio * (baselineY - topY);
      return { x, y, value: val };
    });
  }, [
    totalSpending,
    tags.length,
    currentExpenses,
    isWeekOrMonth,
    activeTagIndex,
    chartWidth,
    topVal,
    baselineY,
    topY,
  ]);

  const linePath = useMemo(() => getSmoothPath(points), [points]);
  const areaPath = useMemo(() => getAreaPath(points, baselineY), [points, baselineY]);

  const activePoint = points[Math.min(activeTagIndex, points.length - 1)] || null;

  // 5. Dynamic Insights
  const insights = useMemo(() => {
    if (categories.length === 0 || totalSpending === 0) return [];

    const list: {
      id: string;
      type: 'increase' | 'decrease';
      textPrefix: string;
      highlightText: string;
      textSuffix: string;
    }[] = [];

    const topCategory = categories[0];
    if (topCategory) {
      list.push({
        id: 'top-cat',
        type: 'increase',
        textPrefix: `${topCategory.name} was your largest expense at `,
        highlightText: `${topCategory.percentage}%`,
        textSuffix: ` of total spending.`,
      });
    }

    if (categories.length > 1) {
      const secondCategory = categories[1];
      list.push({
        id: 'second-cat',
        type: 'decrease',
        textPrefix: `Followed by ${secondCategory.name} accounting for `,
        highlightText: `${secondCategory.percentage}%`,
        textSuffix: ` (${formatCurrency(secondCategory.amount)}).`,
      });
    } else {
      list.push({
        id: 'tx-count',
        type: 'decrease',
        textPrefix: `You recorded `,
        highlightText: `${currentExpenses.length} transactions`,
        textSuffix: ` in this period.`,
      });
    }

    return list;
  }, [categories, totalSpending, currentExpenses.length]);

  // Donut chart calculations
  const donutSize = moderateScale(134);
  const donutStrokeWidth = moderateScale(22);
  const donutRadius = (donutSize - donutStrokeWidth) / 2;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutCenter = donutSize / 2;
  const donutGap = moderateScale(3);

  let cumulativeArcOffset = 0;

  const hasData = currentExpenses.length > 0 && totalSpending > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Title & Subtitle */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Understand where your money goes</Text>
        </View>

        {/* Segmented Period Selector (Week | Month | Year) */}
        <View style={styles.pillContainer}>
          {(['week', 'month', 'year'] as AnalyticsPeriod[]).map(p => {
            const isSelected = period === p;
            const label = p.charAt(0).toUpperCase() + p.slice(1);
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                style={[styles.pillButton, isSelected && styles.pillButtonActive]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Select ${label} period`}
              >
                <Text
                  style={[
                    styles.pillButtonText,
                    isSelected && styles.pillButtonTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading ? (
          <View style={{ gap: moderateScale(16) }}>
            <SpendingOverviewSkeleton />
            <SummaryCardSkeleton />
          </View>
        ) : !hasData ? (
          /* Error / Empty State When No Expense Data is Available */
          <View style={styles.errorCard}>
            <View style={styles.errorIconCircle}>
              <AlertCircle
                size={moderateScale(32)}
                color={COLORS.petrol}
                strokeWidth={2.2}
              />
            </View>
            <Text style={styles.errorTitle}>No Expense Data Available</Text>
            <Text style={styles.errorSubtitle}>
              No expense transactions found for this {period}. Start tracking your spending to see your analytics.
            </Text>
            <TouchableOpacity
              style={styles.errorActionButton}
              onPress={() => navigation.navigate(SCREEN_NAMES.ADD_EXPENSE)}
              activeOpacity={0.8}
            >
              <Plus size={moderateScale(18)} color={COLORS.white} strokeWidth={2.5} />
              <Text style={styles.errorActionButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Card 1: TOTAL SPENDING Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.amountContainer}>
                  <Text style={styles.cardSubtitle}>TOTAL SPENDING</Text>
                  <Text style={styles.amountText}>{formatCurrency(totalSpending)}</Text>
                  <Text style={styles.comparisonText}>{vsText}</Text>
                </View>

                {/* Percentage Badge */}
                <View
                  style={[
                    styles.percentageBadge,
                    !isDecrease && { backgroundColor: '#FFE8EC' },
                  ]}
                >
                  <Text
                    style={[
                      styles.percentageText,
                      !isDecrease && { color: '#E01E37' },
                    ]}
                  >
                    {percentageChangeText}
                  </Text>
                </View>
              </View>

              {/* Spline Wave Chart with Dotted Gridlines */}
              <View style={styles.chartWrapper}>
                {/* Y-Axis Column */}
                <View style={styles.yAxisColumn}>
                  <Text style={styles.yAxisText}>{tierLabels[0]}</Text>
                  <Text style={styles.yAxisText}>{tierLabels[1]}</Text>
                  <Text style={styles.yAxisText}>{tierLabels[2]}</Text>
                </View>

                {/* SVG Container */}
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
                      <SvgLinearGradient
                        id="analyticsAreaGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
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

                    {/* Gradient Fill Under Curve */}
                    {areaPath ? (
                      <Path d={areaPath} fill="url(#analyticsAreaGradient)" />
                    ) : null}

                    {/* Petrol Wave Curve */}
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

                    {/* Active Highlight Red Dot with White Center */}
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
                {tags.map((tag, idx) => (
                  <Text key={`${tag}-${idx}`} style={styles.xTagText}>
                    {tag}
                  </Text>
                ))}
              </View>
            </View>

            {/* Section Heading: Spending by Category */}
            <Text style={styles.sectionHeading}>Spending by Category</Text>

            {/* Card 2: Donut Chart + Category Legend */}
            <View style={styles.card}>
              <View style={styles.donutCardRow}>
                {/* Left: Donut Chart with Total in Center */}
                <View style={styles.donutWrapper}>
                  <Svg
                    width={donutSize}
                    height={donutSize}
                    viewBox={`0 0 ${donutSize} ${donutSize}`}
                  >
                    {categories.map(cat => {
                      const arcLength = (cat.percentage / 100) * donutCircumference;
                      const dashLength = Math.max(arcLength - donutGap, 1);
                      const dashArray = `${dashLength} ${donutCircumference - dashLength}`;
                      const currentOffset = -cumulativeArcOffset;
                      cumulativeArcOffset += arcLength;

                      return (
                        <Circle
                          key={cat.id}
                          cx={donutCenter}
                          cy={donutCenter}
                          r={donutRadius}
                          stroke={cat.color}
                          strokeWidth={donutStrokeWidth}
                          strokeDasharray={dashArray}
                          strokeDashoffset={currentOffset}
                          strokeLinecap="butt"
                          fill="none"
                          origin={`${donutCenter}, ${donutCenter}`}
                          rotation="-90"
                        />
                      );
                    })}
                  </Svg>

                  {/* Hole Center Label */}
                  <View style={styles.donutHoleContainer} pointerEvents="none">
                    <Text
                      style={styles.donutAmountText}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {formatCurrency(totalSpending)}
                    </Text>
                    <Text style={styles.donutTotalLabel}>Total</Text>
                  </View>
                </View>

                {/* Right: Category Legend */}
                <View style={styles.legendContainer}>
                  {categories.map(cat => (
                    <View key={cat.id} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                      <Text style={styles.legendName} numberOfLines={1}>
                        {cat.name}
                      </Text>
                      <Text style={styles.legendPercent}>{cat.percentage}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Card 3: Category Breakdown List */}
            <View style={styles.breakdownCard}>
              {categories.map((cat, idx) => (
                <React.Fragment key={cat.id}>
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownLeft}>
                      <View
                        style={[styles.breakdownDot, { backgroundColor: cat.color }]}
                      />
                      <View>
                        <Text style={styles.breakdownName}>{cat.name}</Text>
                        <Text style={styles.breakdownSubtitle}>
                          {cat.percentage}% of spending
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.breakdownAmount}>
                      {formatCurrency(cat.amount)}
                    </Text>
                  </View>
                  {idx < categories.length - 1 && (
                    <View style={styles.breakdownDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Section Heading: Insights */}
            <Text style={styles.sectionHeading}>Insights</Text>

            {/* Card 4: Insights Card */}
            <View style={styles.insightsCard}>
              {insights.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <View style={styles.insightRow}>
                    <View style={styles.insightIconBadge}>
                      {item.type === 'increase' ? (
                        <ArrowUpRight
                          size={moderateScale(18)}
                          color="#0B5563"
                          strokeWidth={2.6}
                        />
                      ) : (
                        <ArrowDownLeft
                          size={moderateScale(18)}
                          color="#0B5563"
                          strokeWidth={2.6}
                        />
                      )}
                    </View>
                    <Text style={styles.insightText}>
                      {item.textPrefix}
                      <Text style={styles.insightTextBold}>{item.highlightText}</Text>
                      {item.textSuffix}
                    </Text>
                  </View>
                  {idx < insights.length - 1 && (
                    <View style={styles.insightDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <BottomNavigation activeTab="analytics" floating />
    </SafeAreaView>
  );
});

export default AnalyticsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EBF9F7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(18),
    paddingTop: moderateScale(14),
    paddingBottom: moderateScale(110),
  },
  header: {
    marginBottom: moderateScale(16),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: '#0B2027',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: moderateScale(13.5),
    fontWeight: '500',
    color: '#6E8894',
    marginTop: moderateScale(3),
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCF5F2',
    borderRadius: moderateScale(23),
    height: moderateScale(46),
    padding: moderateScale(4),
    marginBottom: moderateScale(18),
  },
  pillButton: {
    flex: 1,
    height: '100%',
    borderRadius: moderateScale(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#0E3940',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  pillButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#5F808B',
  },
  pillButtonTextActive: {
    fontWeight: '700',
    color: '#0B5563',
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
    marginBottom: moderateScale(18),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: moderateScale(12),
  },
  amountContainer: {
    flex: 1,
  },
  cardSubtitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#8A9FA8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  amountText: {
    fontSize: moderateScale(28),
    fontWeight: '900',
    color: '#0B2027',
    marginTop: moderateScale(3),
    letterSpacing: -0.5,
  },
  comparisonText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: '#7C95A0',
    marginTop: moderateScale(3),
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
    marginTop: moderateScale(6),
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
    paddingHorizontal: moderateScale(4),
    marginTop: moderateScale(10),
  },
  xTagText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#8A9FA8',
  },
  sectionHeading: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#0B2027',
    letterSpacing: -0.3,
    marginBottom: moderateScale(12),
    marginTop: moderateScale(4),
  },
  donutCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donutWrapper: {
    width: moderateScale(134),
    height: moderateScale(134),
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHoleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(6),
  },
  donutAmountText: {
    fontSize: moderateScale(12.5),
    fontWeight: '800',
    color: '#0B2027',
    textAlign: 'center',
  },
  donutTotalLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#7C95A0',
    marginTop: moderateScale(1),
    textAlign: 'center',
  },
  legendContainer: {
    flex: 1,
    marginLeft: moderateScale(20),
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(9),
  },
  legendDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginRight: moderateScale(8),
  },
  legendName: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#0B2027',
    flex: 1,
  },
  legendPercent: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#0B2027',
    marginLeft: moderateScale(6),
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(24),
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    borderWidth: 1.5,
    borderColor: 'rgba(219, 237, 240, 0.75)',
    shadowColor: '#0E3940',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: moderateScale(20),
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(6),
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginRight: moderateScale(12),
  },
  breakdownName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#0B2027',
  },
  breakdownSubtitle: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: '#7C95A0',
    marginTop: moderateScale(2),
  },
  breakdownAmount: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#0B2027',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(219, 237, 240, 0.7)',
    marginVertical: moderateScale(8),
  },
  insightsCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(24),
    padding: moderateScale(18),
    borderWidth: 1.5,
    borderColor: 'rgba(219, 237, 240, 0.75)',
    shadowColor: '#0E3940',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: moderateScale(30),
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIconBadge: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(10),
    backgroundColor: '#D9F6F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  insightText: {
    flex: 1,
    fontSize: moderateScale(13.5),
    fontWeight: '500',
    color: '#2A434F',
    lineHeight: moderateScale(20),
  },
  insightTextBold: {
    fontWeight: '800',
    color: '#0B2027',
  },
  insightDivider: {
    height: 1,
    backgroundColor: 'rgba(219, 237, 240, 0.7)',
    marginVertical: moderateScale(14),
  },
  errorCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(24),
    padding: moderateScale(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(219, 237, 240, 0.75)',
    shadowColor: '#0E3940',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    marginTop: moderateScale(20),
    marginBottom: moderateScale(40),
  },
  errorIconCircle: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: '#DCF5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(16),
  },
  errorTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#0B2027',
    marginBottom: moderateScale(8),
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: moderateScale(13.5),
    fontWeight: '500',
    color: '#6E8894',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(22),
    paddingHorizontal: moderateScale(12),
  },
  errorActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.petrol,
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(22),
    borderRadius: moderateScale(14),
    gap: moderateScale(6),
    ...SHADOWS.soft,
  },
  errorActionButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.white,
  },
});