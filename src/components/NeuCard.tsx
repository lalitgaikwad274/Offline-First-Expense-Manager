import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../utils/constants';

export interface NeuCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  highlightColor?: string;
  showHighlight?: boolean;
}

export const NeuCard = memo(({
  children,
  style,
  highlightColor = 'rgba(255, 255, 255, 0.95)',
  showHighlight = true,
}: NeuCardProps) => {
  return (
    <View style={[styles.card, style]}>
      {showHighlight && (
        <View style={[styles.highlight, { backgroundColor: highlightColor }]} />
      )}
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.cardRadius,
    ...SHADOWS.soft,
  },
  highlight: {
    position: 'absolute',
    top: 1,
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 2,
  },
});

export default NeuCard;
