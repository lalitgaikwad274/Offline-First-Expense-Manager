import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../utils/constants';

export interface CategoryItemProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  isPrimary?: boolean;
  color?: string;
  backgroundColor?: string;
  onPress?: (id: string) => void;
}

export const CategoryItem = memo(({
  id,
  title,
  icon: Icon,
  isPrimary = false,
  color,
  backgroundColor,
  onPress,
}: CategoryItemProps) => {
  const iconColor = color || (isPrimary ? COLORS.white : COLORS.navy);

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title.replace('\n', ' ')}
    >
      <View
        style={[
          styles.iconContainer,
          isPrimary && styles.primaryIconContainer,
          backgroundColor ? { backgroundColor } : undefined,
        ]}
      >
        <Icon
          size={isPrimary ? moderateScale(34) : moderateScale(26)}
          color={iconColor}
          strokeWidth={isPrimary ? 2.2 : 2.2}
        />
      </View>

      <Text
        style={[
          styles.title,
          isPrimary && styles.primaryTitle,
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: moderateScale(72),
  },
  iconContainer: {
    width: moderateScale(66),
    height: moderateScale(66),
    borderRadius: SPACING.iconRadius,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  primaryIconContainer: {
    backgroundColor: COLORS.expense,
    ...SHADOWS.medium,
  },
  title: {
    color: COLORS.navy,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(15),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: moderateScale(8),
  },
  primaryTitle: {
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },
});

export default CategoryItem;
