import React, { memo } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Calculator,
  Check,
  ChevronRight,
  Divide,
  Percent,
  PieChart,
  Users,
  X,
} from 'lucide-react-native';
import { SplitType } from '../../types/groupExpense';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';

export interface SplitSelectorModalProps {
  visible: boolean;
  totalAmount: number;
  selectedSplitType: SplitType;
  participantCount: number;
  onClose: () => void;
  onSelectSplitType: (type: SplitType) => void;
}

export const SplitSelectorModal = memo(({
  visible,
  totalAmount,
  selectedSplitType,
  participantCount,
  onClose,
  onSelectSplitType,
}: SplitSelectorModalProps) => {
  const perPersonEqual =
    participantCount > 0 ? (totalAmount / participantCount).toFixed(0) : '0';

  const options: {
    id: SplitType;
    title: string;
    subtitle: string;
    icon: any;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      id: 'equal',
      title: 'Equal',
      subtitle: `₹${perPersonEqual} each`,
      icon: Users,
      iconBg: '#E8F5F7',
      iconColor: COLORS.primary,
    },
    {
      id: 'exact',
      title: 'Exact amounts',
      subtitle: 'Set amount for each person',
      icon: Calculator,
      iconBg: '#FFF4E6',
      iconColor: '#FD7E14',
    },
    {
      id: 'percentage',
      title: 'Percentages',
      subtitle: 'Set percentage for each person',
      icon: Percent,
      iconBg: '#F3F0FF',
      iconColor: '#7950F2',
    },
    {
      id: 'shares',
      title: 'Shares',
      subtitle: 'Assign number of shares',
      icon: PieChart,
      iconBg: '#E6FCF5',
      iconColor: '#20C997',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select split type</Text>
              <Text style={styles.subtitle}>
                How should ₹{totalAmount.toLocaleString('en-IN')} be split?
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={styles.closeButton}
            >
              <X size={moderateScale(20)} color={COLORS.navy} />
            </Pressable>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {options.map((opt) => {
              const IconComponent = opt.icon;
              const isSelected = selectedSplitType === opt.id;

              return (
                <Pressable
                  key={opt.id}
                  onPress={() => onSelectSplitType(opt.id)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.optionLeft}>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: opt.iconBg },
                      ]}
                    >
                      <IconComponent
                        size={moderateScale(20)}
                        color={opt.iconColor}
                        strokeWidth={2.2}
                      />
                    </View>

                    <View style={styles.optionInfo}>
                      <Text
                        style={[
                          styles.optionTitle,
                          isSelected && styles.optionTitleSelected,
                        ]}
                      >
                        {opt.title}
                      </Text>
                      <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                    </View>
                  </View>

                  {isSelected ? (
                    <View style={styles.checkCircle}>
                      <Check
                        size={moderateScale(14)}
                        color={COLORS.white}
                        strokeWidth={2.6}
                      />
                    </View>
                  ) : (
                    <ChevronRight
                      size={moderateScale(18)}
                      color={COLORS.textMuted}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(7, 27, 58, 0.4)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: moderateScale(22),
    paddingBottom: moderateScale(36),
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: moderateScale(18),
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
    marginTop: moderateScale(3),
    fontWeight: '500',
  },
  closeButton: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsList: {
    gap: moderateScale(10),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFCFD',
    borderRadius: moderateScale(18),
    padding: moderateScale(14),
    borderWidth: 1.5,
    borderColor: '#E8EEF3',
  },
  optionCardSelected: {
    backgroundColor: '#EBF8FA',
    borderColor: COLORS.primary,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },
  optionTitleSelected: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  optionSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  checkCircle: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});

export default SplitSelectorModal;
