import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View, } from 'react-native';
import { ChevronRight, WifiOff } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../utils/constants';

export interface OfflineBannerProps {
  onPress?: () => void;
  title?: string;
  subtitle?: string;
}

export const OfflineBanner = memo(({
  onPress,
  title = 'You are offline',
  subtitle = "Your data will sync automatically when you're back online.",
}: OfflineBannerProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Offline banner alert"
    >
      <View style={styles.iconContainer}>
        <WifiOff size={moderateScale(28)} color={COLORS.white} strokeWidth={2.4} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <ChevronRight
        size={moderateScale(24)}
        color={COLORS.white}
        strokeWidth={2.5}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: moderateScale(90),
    borderRadius: SPACING.cardRadius,
    backgroundColor: COLORS.expense,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.cardPadding,
    paddingVertical: moderateScale(14),
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  iconContainer: {
    width: moderateScale(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: moderateScale(10),
    marginRight: moderateScale(6),
  },
  title: {
    color: COLORS.white,
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginBottom: moderateScale(2),
  },
  subtitle: {
    color: '#FFE9EC',
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

export default OfflineBanner;
