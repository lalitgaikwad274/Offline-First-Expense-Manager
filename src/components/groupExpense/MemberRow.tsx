import React, { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MoreVertical, Trash2, UserCheck, Shield } from 'lucide-react-native';
import { GroupMember } from '../../types/groupExpense';
import { COLORS, SHADOWS, moderateScale } from '../../utils/constants';

export interface MemberRowProps {
  member: GroupMember;
  canRemove?: boolean;
  onRemove?: (member: GroupMember) => void;
  onPress?: (member: GroupMember) => void;
}

export const MemberRow = memo(({
  member,
  canRemove = false,
  onRemove,
  onPress,
}: MemberRowProps) => {
  const isMe = member.isCurrentUser;
  const isAdmin = member.isAdmin;
  const avatarColor = member.color || (isMe ? COLORS.primary : '#845EF7');

  let roleLabel = 'Member';
  if (isMe && isAdmin) roleLabel = 'You · Admin';
  else if (isMe) roleLabel = 'You';
  else if (isAdmin) roleLabel = 'Admin';

  return (
    <Pressable
      onPress={() => onPress?.(member)}
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
            {member.name}
          </Text>
          <View style={styles.roleRow}>
            {isAdmin && (
              <Shield
                size={moderateScale(12)}
                color={COLORS.primary}
                strokeWidth={2.4}
                style={styles.adminIcon}
              />
            )}
            <Text
              style={[
                styles.roleText,
                (isMe || isAdmin) && styles.roleTextHighlighted,
              ]}
            >
              {roleLabel}
            </Text>
          </View>
        </View>
      </View>

      {canRemove && !isMe && onRemove && (
        <Pressable
          onPress={() => onRemove(member)}
          hitSlop={8}
          style={styles.removeButton}
        >
          <Trash2 size={moderateScale(18)} color={COLORS.expense} strokeWidth={2} />
        </Pressable>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    marginBottom: moderateScale(10),
    borderWidth: 1,
    borderColor: '#EEF3F7',
    ...SHADOWS.soft,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  adminIcon: {
    marginRight: 4,
  },
  roleText: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  roleTextHighlighted: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  removeButton: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});

export default MemberRow;
