import React, { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { GroupMember } from '../../types/groupExpense';
import { COLORS, moderateScale } from '../../utils/constants';

export interface SplitMemberRowProps {
  member: GroupMember;
  mode: 'checkbox' | 'exact' | 'percentage' | 'shares';
  isSelected?: boolean;
  value?: number | string;
  calculatedAmount?: number;
  onToggleSelect?: (memberId: string) => void;
  onChangeValue?: (memberId: string, val: string) => void;
}

export const SplitMemberRow = memo(({
  member,
  mode,
  isSelected = false,
  value = '',
  calculatedAmount,
  onToggleSelect,
  onChangeValue,
}: SplitMemberRowProps) => {
  const isMe = member.isCurrentUser;
  const displayName = member.name;
  const subtitle = isMe ? 'You' : member.phone || '';

  const avatarColor = member.color || (isMe ? COLORS.primary : '#845EF7');

  if (mode === 'checkbox') {
    return (
      <Pressable
        onPress={() => onToggleSelect?.(member.id)}
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.leftGroup}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{member.initials || 'U'}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View
          style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected,
          ]}
        >
          {isSelected && (
            <Check
              size={moderateScale(14)}
              color={COLORS.white}
              strokeWidth={3}
            />
          )}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{member.initials || 'U'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
            {calculatedAmount !== undefined && mode !== 'exact'
              ? ` · ₹${calculatedAmount.toFixed(0)}`
              : ''}
          </Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        {mode === 'exact' && <Text style={styles.currencyPrefix}>₹</Text>}
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(value || '')}
          onChangeText={(text) => onChangeValue?.(member.id, text)}
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
        />
        {mode === 'percentage' && <Text style={styles.percentageSuffix}>%</Text>}
        {mode === 'shares' && <Text style={styles.sharesSuffix}>shares</Text>}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F7',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: moderateScale(12),
  },
  avatar: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(21),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  avatarText: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: COLORS.white,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },
  subtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(7),
    borderWidth: 2,
    borderColor: '#CED4DA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: COLORS.incomeDark,
    borderColor: COLORS.incomeDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F6F9',
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    height: moderateScale(42),
    minWidth: moderateScale(90),
    borderWidth: 1,
    borderColor: '#E2E9F0',
  },
  currencyPrefix: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
    marginRight: moderateScale(4),
  },
  input: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
    paddingVertical: 0,
    textAlign: 'center',
    minWidth: moderateScale(40),
  },
  percentageSuffix: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: moderateScale(4),
  },
  sharesSuffix: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: moderateScale(4),
  },
  pressed: {
    opacity: 0.7,
  },
});

export default SplitMemberRow;
