import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS, moderateScale, SHADOWS } from '../utils/constants';

export interface ShimmerPlaceholderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  shimmerColors?: string[];
  backgroundColor?: string;
  duration?: number;
}

/**
 * Reusable 60fps Shimmer Placeholder
 */
export const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = moderateScale(8),
  style,
  shimmerColors = [
    'rgba(255, 255, 255, 0)',
    'rgba(255, 255, 255, 0.65)',
    'rgba(255, 255, 255, 0)',
  ],
  backgroundColor = '#DEE8EC',
  duration = 1300,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue, duration]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350],
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor,
          overflow: 'hidden',
          position: 'relative',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            width: '100%',
            height: '100%',
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

/**
 * Shimmer skeleton for SummaryCard
 */
export const SummaryCardSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.summaryCard}>
      {/* Top Row: Title & Period */}
      <View style={skeletonStyles.rowBetween}>
        <ShimmerPlaceholder
          width={moderateScale(105)}
          height={moderateScale(15)}
          borderRadius={moderateScale(6)}
        />
        <ShimmerPlaceholder
          width={moderateScale(90)}
          height={moderateScale(26)}
          borderRadius={moderateScale(13)}
        />
      </View>

      {/* Big Expense Amount */}
      <ShimmerPlaceholder
        width={moderateScale(175)}
        height={moderateScale(36)}
        borderRadius={moderateScale(8)}
        style={{ marginTop: moderateScale(14) }}
      />

      {/* Wave Area Placeholder */}
      <ShimmerPlaceholder
        width="100%"
        height={moderateScale(44)}
        borderRadius={moderateScale(12)}
        style={{ marginTop: moderateScale(14), opacity: 0.65 }}
      />

      {/* Bottom Income and Balance Columns */}
      <View style={[skeletonStyles.rowBetween, { marginTop: moderateScale(16) }]}>
        <View style={skeletonStyles.statCol}>
          <ShimmerPlaceholder
            width={moderateScale(65)}
            height={moderateScale(12)}
            borderRadius={moderateScale(6)}
          />
          <ShimmerPlaceholder
            width={moderateScale(95)}
            height={moderateScale(18)}
            borderRadius={moderateScale(6)}
            style={{ marginTop: moderateScale(4) }}
          />
        </View>

        <View style={skeletonStyles.statDivider} />

        <View style={skeletonStyles.statCol}>
          <ShimmerPlaceholder
            width={moderateScale(65)}
            height={moderateScale(12)}
            borderRadius={moderateScale(6)}
          />
          <ShimmerPlaceholder
            width={moderateScale(95)}
            height={moderateScale(18)}
            borderRadius={moderateScale(6)}
            style={{ marginTop: moderateScale(4) }}
          />
        </View>
      </View>
    </View>
  );
};

/**
 * Shimmer skeleton for SpendingOverviewCard
 */
export const SpendingOverviewSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.spendingOuter}>
      {/* Section Header */}
      <View style={skeletonStyles.rowBetween}>
        <ShimmerPlaceholder
          width={moderateScale(155)}
          height={moderateScale(20)}
          borderRadius={moderateScale(6)}
        />
        <ShimmerPlaceholder
          width={moderateScale(85)}
          height={moderateScale(16)}
          borderRadius={moderateScale(6)}
        />
      </View>

      {/* Main Elevated Card */}
      <View style={skeletonStyles.spendingCard}>
        {/* Metric Header */}
        <View style={skeletonStyles.rowBetween}>
          <View>
            <ShimmerPlaceholder
              width={moderateScale(120)}
              height={moderateScale(12)}
              borderRadius={moderateScale(6)}
            />
            <ShimmerPlaceholder
              width={moderateScale(165)}
              height={moderateScale(30)}
              borderRadius={moderateScale(8)}
              style={{ marginTop: moderateScale(6) }}
            />
          </View>
          <ShimmerPlaceholder
            width={moderateScale(60)}
            height={moderateScale(24)}
            borderRadius={moderateScale(11)}
          />
        </View>

        {/* Chart View with Y-axis & curve placeholder */}
        <View style={skeletonStyles.chartPlaceholderRow}>
          <View style={skeletonStyles.yAxisPlaceholder}>
            <ShimmerPlaceholder
              width={moderateScale(26)}
              height={moderateScale(11)}
              borderRadius={moderateScale(4)}
            />
            <ShimmerPlaceholder
              width={moderateScale(26)}
              height={moderateScale(11)}
              borderRadius={moderateScale(4)}
            />
            <ShimmerPlaceholder
              width={moderateScale(26)}
              height={moderateScale(11)}
              borderRadius={moderateScale(4)}
            />
          </View>

          <View style={skeletonStyles.chartCanvasPlaceholder}>
            <ShimmerPlaceholder
              width="100%"
              height="100%"
              borderRadius={moderateScale(14)}
              backgroundColor="rgba(222, 232, 236, 0.45)"
            />
          </View>
        </View>

        {/* X-Axis Tags */}
        <View style={skeletonStyles.xAxisPlaceholderRow}>
          {[1, 2, 3, 4, 5, 6, 7].map(key => (
            <ShimmerPlaceholder
              key={key}
              width={moderateScale(19)}
              height={moderateScale(19)}
              borderRadius={moderateScale(3.5)}
              backgroundColor="#E2ECEE"
            />
          ))}
        </View>
      </View>
    </View>
  );
};

/**
 * Shimmer skeleton for Recent Expenses list
 */
export const RecentExpensesSkeleton: React.FC = () => {
  return (
    <View style={skeletonStyles.recentCard}>
      {[1, 2, 3].map((item, index) => (
        <View key={item}>
          <View style={skeletonStyles.recentItemRow}>
            {/* Avatar circle */}
            <ShimmerPlaceholder
              width={moderateScale(40)}
              height={moderateScale(40)}
              borderRadius={moderateScale(20)}
            />

            {/* Title & Date */}
            <View style={{ flex: 1, marginLeft: moderateScale(12) }}>
              <ShimmerPlaceholder
                width={moderateScale(125)}
                height={moderateScale(14)}
                borderRadius={moderateScale(6)}
              />
              <ShimmerPlaceholder
                width={moderateScale(75)}
                height={moderateScale(10)}
                borderRadius={moderateScale(4)}
                style={{ marginTop: moderateScale(6) }}
              />
            </View>

            {/* Amount */}
            <ShimmerPlaceholder
              width={moderateScale(65)}
              height={moderateScale(16)}
              borderRadius={moderateScale(6)}
            />
          </View>
          {index < 2 && <View style={skeletonStyles.itemDivider} />}
        </View>
      ))}
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: moderateScale(28),
    padding: moderateScale(22),
    marginTop: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    ...SHADOWS.soft,
  },
  statCol: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: moderateScale(30),
    backgroundColor: 'rgba(219, 237, 240, 0.9)',
    marginHorizontal: moderateScale(14),
  },
  spendingOuter: {
    marginTop: moderateScale(16),
    marginBottom: moderateScale(6),
  },
  spendingCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    marginTop: moderateScale(12),
    borderWidth: 1.5,
    borderColor: 'rgba(219, 237, 240, 0.75)',
    shadowColor: '#0E3940',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  chartPlaceholderRow: {
    flexDirection: 'row',
    height: moderateScale(110),
    marginTop: moderateScale(10),
  },
  yAxisPlaceholder: {
    width: moderateScale(36),
    height: moderateScale(110),
    justifyContent: 'space-between',
    paddingBottom: moderateScale(10),
    paddingTop: moderateScale(4),
  },
  chartCanvasPlaceholder: {
    flex: 1,
    height: moderateScale(110),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  xAxisPlaceholderRow: {
    flexDirection: 'row',
    marginLeft: moderateScale(36),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(2),
    marginTop: moderateScale(10),
  },
  recentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    ...SHADOWS.soft,
  },
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(6),
  },
  itemDivider: {
    height: 1,
    backgroundColor: 'rgba(219, 237, 240, 0.7)',
    marginVertical: moderateScale(8),
  },
});
