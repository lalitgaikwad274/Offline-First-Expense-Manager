import { moderateScale } from './responsive';

export const SPACING = {
  none: 0,
  xxs: moderateScale(2),
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  xxxl: moderateScale(32),

  // Layout specific
  screenPaddingHorizontal: moderateScale(18),
  screenPaddingVertical: moderateScale(12),
  cardPadding: moderateScale(16),
  cardRadius: moderateScale(28),
  cardRadiusSmall: moderateScale(18),
  cardRadiusLarge: moderateScale(32),
  iconRadius: moderateScale(25),
  gapSmall: moderateScale(8),
  gapMedium: moderateScale(12),
  gapLarge: moderateScale(16),
};

export type SpacingType = typeof SPACING;
