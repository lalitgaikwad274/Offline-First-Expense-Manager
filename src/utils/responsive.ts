import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base design reference (standard mobile screen, e.g. iPhone 13/14/15)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Linear width scale helper
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Linear height scale helper
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export function scalePxToDP(size: number) {
  const newSize = size * SCREEN_WIDTH / 375;
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1

}

/**
 * Moderate scale helper for font sizes and padding with customizable factor
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Responsive width percentage
 */
export const wp = (percentage: number): number => {
  return (percentage * SCREEN_WIDTH) / 100;
};

/**
 * Responsive height percentage
 */
export const hp = (percentage: number): number => {
  return (percentage * SCREEN_HEIGHT) / 100;
};

/**
 * Screen dimensions & device category helpers
 */
export const DEVICE = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 420,
  isLargeDevice: SCREEN_WIDTH >= 420,
  pixelRatio: PixelRatio.get(),
};
