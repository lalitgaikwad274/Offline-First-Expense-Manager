import React, { memo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Bell, Menu, Sparkles, Wallet } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../utils/constants';

export interface HeaderProps {
  userName?: string;
  userInitials?: string;
  notificationCount?: number;
  onOpenDrawer?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onLogoPress?: () => void;
}

export const Header = memo(({
  userName = 'Lalit',
  userInitials = 'L',
  notificationCount = 1,
  onOpenDrawer,
  onNotificationPress,
  onProfilePress,
  onLogoPress,
}: HeaderProps) => {
  const handleLogoPress = () => {
    if (onLogoPress) {
      onLogoPress();
    } else {
      Alert.alert(
        'Expense Manager ⚡️',
        'Expensio Offline-First Expense Manager\n\nVersion: 1.0.0\nDatabase: SQLite Active\nRedux State: Synced',
        [{ text: 'Awesome!', style: 'default' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar: Left Drawer Button & Clickable Logo + Right Action Buttons */}
      <View style={styles.topBar}>
        <View style={styles.topLeftGroup}>
          {/* Drawer Menu Button */}
          <Pressable
            onPress={onOpenDrawer}
            hitSlop={8}
            style={({ pressed }) => [
              styles.drawerButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open Navigation Drawer"
          >
            <Menu size={moderateScale(22)} color={COLORS.navy} strokeWidth={2.4} />
          </Pressable>

          {/* Clickable Logo with Alert */}
          <Pressable
            onPress={handleLogoPress}
            hitSlop={8}
            style={({ pressed }) => [
              styles.logoButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="App Logo"
          >
            <LinearGradient
              colors={COLORS.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <Wallet size={moderateScale(17)} color={COLORS.white} strokeWidth={2.4} />
            </LinearGradient>
            <View>
              <View style={styles.logoTitleRow}>
                <Text style={styles.logoText}>Expensio</Text>
                <Sparkles size={moderateScale(12)} color={COLORS.primary} strokeWidth={2.5} />
              </View>
              <Text style={styles.logoSubtitle}>Offline-First</Text>
            </View>
          </Pressable>
        </View>

        {/* Top Right: Notifications & Profile */}
        <View style={styles.headerRight}>
          <Pressable
            onPress={onNotificationPress}
            hitSlop={12}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <View>
              <Bell size={moderateScale(24)} color={COLORS.navy} strokeWidth={2.2} />
              {notificationCount > 0 && <View style={styles.notificationDot} />}
            </View>
          </Pressable>

          <Pressable
            onPress={onProfilePress}
            hitSlop={8}
            style={({ pressed }) => [
              styles.avatarWrapper,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="User Profile"
          >
            <LinearGradient
              colors={COLORS.gradientAvatar}
              style={styles.avatarBackground}
            >
              <Text style={styles.avatarText}>{userInitials}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      {/* Greeting Row */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingContainer}>
          <Text style={styles.helloText}>Hello,</Text>
          <Text style={styles.userName}>
            {userName} <Text style={styles.wave}>👋</Text>
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  drawerButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    backgroundColor: COLORS.surface,
    paddingVertical: moderateScale(5),
    paddingHorizontal: moderateScale(9),
    borderRadius: moderateScale(14),
    ...SHADOWS.soft,
  },
  logoBadge: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(3),
  },
  logoText: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.3,
  },
  logoSubtitle: {
    fontSize: moderateScale(8.5),
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  headerIconButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  notificationDot: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: moderateScale(9),
    height: moderateScale(9),
    borderRadius: moderateScale(5),
    backgroundColor: COLORS.expense,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  avatarWrapper: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  avatarBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: moderateScale(17),
    color: COLORS.navy,
    fontWeight: '800',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(6),
  },
  greetingContainer: {
    flex: 1,
  },
  helloText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(18),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  userName: {
    marginTop: 1,
    fontSize: moderateScale(24),
    lineHeight: moderateScale(28),
    color: COLORS.navy,
    fontWeight: '800',
  },
  wave: {
    fontSize: moderateScale(22),
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
});

export default Header;
