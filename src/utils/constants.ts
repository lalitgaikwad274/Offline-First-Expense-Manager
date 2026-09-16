import { COLORS } from './colors';
import { SPACING } from './spacing';
import { TYPOGRAPHY, FONT_SIZES, FONT_WEIGHTS } from './typography';
import { DEVICE, scale, verticalScale, moderateScale, wp, hp } from './responsive';

export { COLORS, SPACING, TYPOGRAPHY, FONT_SIZES, FONT_WEIGHTS, DEVICE, scale, verticalScale, moderateScale, wp, hp };

export const SHADOWS = {
  soft: {
    shadowColor: COLORS.softShadowColor,
    shadowOffset: {
      width: 4,
      height: 5,
    },
    shadowOpacity: 0.14,
    shadowRadius: 9,
    elevation: 5,
  },
  medium: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 5,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 7,
  },
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const APP_CONFIG = {
  appName: 'Expense Manager',
  version: '1.0.0',
  currencySymbol: '₹',
  defaultLocale: 'en-IN',
};
