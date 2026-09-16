import { TextStyle } from 'react-native';
import { moderateScale } from './responsive';
import { COLORS } from './colors';

export const FONT_SIZES = {
  tiny: moderateScale(10),
  caption: moderateScale(12),
  bodySmall: moderateScale(13),
  body: moderateScale(15),
  bodyLarge: moderateScale(17),
  subheading: moderateScale(19),
  headingSmall: moderateScale(22),
  headingMedium: moderateScale(25),
  headingLarge: moderateScale(28),
  display: moderateScale(36),
};

export const FONT_WEIGHTS: Record<string, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
};

export const TYPOGRAPHY: Record<string, TextStyle> = {
  display: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.black,
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  h1: {
    fontSize: FONT_SIZES.headingLarge,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FONT_SIZES.headingMedium,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: FONT_SIZES.headingSmall,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  subheading: {
    fontSize: FONT_SIZES.subheading,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  bodyLarge: {
    fontSize: FONT_SIZES.bodyLarge,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  bodySmall: {
    fontSize: FONT_SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.textMuted,
  },
  button: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
};
