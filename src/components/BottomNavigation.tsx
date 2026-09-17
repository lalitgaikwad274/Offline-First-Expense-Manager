import React, { memo, useCallback } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart3, Home, Plus, Receipt, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, moderateScale } from '../utils/constants';
import { SCREEN_NAMES } from '../utils/screenNames';
import { useAppSelector } from '../store';

export type TabId = 'home' | 'transactions' | 'add' | 'analytics' | 'profile';

export interface BottomNavigationProps {
  activeTab?: string;
  onTabPress?: (id: string) => void;
  onAddPress?: () => void;
  userAvatarUri?: string;
  translateY?: Animated.Value;
  floating?: boolean;
}

const NAV_CONSTANTS = {
  barContentHeight: moderateScale(58),
  fabHaloSize: moderateScale(58),
  fabInnerSize: moderateScale(48),
  iconSize: moderateScale(22),
  avatarSize: moderateScale(26),
} as const;

export const BottomNavigation = memo(({
  activeTab = 'home',
  onTabPress,
  onAddPress,
  userAvatarUri,
  translateY,
  floating = true,
}: BottomNavigationProps) => {
  const navigation = useNavigation<any>();
  let insets = { bottom: 0 };
  try {
    insets = useSafeAreaInsets();
  } catch {
    insets = { bottom: Platform.OS === 'ios' ? moderateScale(16) : moderateScale(8) };
  }

  const reduxUser = useAppSelector(state => state.expense?.user);
  const userInitials = reduxUser?.initials || 'L';

  const handleTabPress = useCallback((tabId: TabId) => {
    if (onTabPress) {
      onTabPress(tabId);
      return;
    }

    if (tabId === activeTab && tabId !== 'add') return;

    switch (tabId) {
      case 'home':
        navigation.navigate(SCREEN_NAMES.HOME);
        break;
      case 'transactions':
        navigation.navigate(SCREEN_NAMES.TRANSACTIONS);
        break;
      case 'add':
        if (onAddPress) {
          onAddPress();
        } else {
          navigation.navigate(SCREEN_NAMES.ADD_EXPENSE);
        }
        break;
      case 'analytics':
        navigation.navigate(SCREEN_NAMES.ANALYTICS);
        break;
      case 'profile':
        navigation.navigate(SCREEN_NAMES.PROFILE);
        break;
    }
  }, [activeTab, navigation, onAddPress, onTabPress]);

  const isHomeActive = activeTab === 'home';
  const isTransactionsActive = activeTab === 'transactions';
  const isAnalyticsActive = activeTab === 'analytics';
  const isProfileActive = activeTab === 'profile';

  const bottomOffset = floating
    ? Math.max(insets.bottom, Platform.OS === 'ios' ? moderateScale(12) : moderateScale(8)) + moderateScale(4)
    : 0;

  const animatedStyle = translateY
    ? { transform: [{ translateY }] }
    : undefined;

  return (
    <Animated.View
      style={[
        floating ? styles.floatingWrapper : styles.fullWidthWrapper,
        floating && { bottom: bottomOffset },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <View style={floating ? styles.floatingContainer : styles.fullWidthContainer}>
        {/* 1. Dashboard Overview (Home) */}
        <Pressable
          onPress={() => handleTabPress('home')}
          hitSlop={moderateScale(8)}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityState={{ selected: isHomeActive }}
          accessibilityLabel="Dashboard Overview"
        >
          <Home
            size={NAV_CONSTANTS.iconSize}
            color={isHomeActive ? COLORS.navActive : COLORS.navInactive}
            strokeWidth={isHomeActive ? 2.5 : 1.9}
          />
          {isHomeActive && <View style={styles.activeDot} />}
        </Pressable>

        {/* 2. Transactions Ledger (Receipt) */}
        <Pressable
          onPress={() => handleTabPress('transactions')}
          hitSlop={moderateScale(8)}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityState={{ selected: isTransactionsActive }}
          accessibilityLabel="Transactions Ledger"
        >
          <Receipt
            size={NAV_CONSTANTS.iconSize}
            color={isTransactionsActive ? COLORS.navActive : COLORS.navInactive}
            strokeWidth={isTransactionsActive ? 2.5 : 1.9}
          />
          {isTransactionsActive && <View style={styles.activeDot} />}
        </Pressable>

        {/* 3. Center Elevated FAB (Add Expense) */}
        <View style={styles.fabSlot} pointerEvents="box-none">
          <Pressable
            onPress={() => handleTabPress('add')}
            style={({ pressed }) => [
              styles.fabHalo,
              pressed && styles.fabPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add New Expense"
          >
            <View style={styles.fabButton}>
              <Plus
                size={moderateScale(24)}
                color={COLORS.white}
                strokeWidth={2.8}
              />
            </View>
          </Pressable>
        </View>

        {/* 4. Analytics & Reports (BarChart3) */}
        <Pressable
          onPress={() => handleTabPress('analytics')}
          hitSlop={moderateScale(8)}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityState={{ selected: isAnalyticsActive }}
          accessibilityLabel="Analytics & Insights"
        >
          <BarChart3
            size={NAV_CONSTANTS.iconSize}
            color={isAnalyticsActive ? COLORS.navActive : COLORS.navInactive}
            strokeWidth={isAnalyticsActive ? 2.5 : 1.9}
          />
          {isAnalyticsActive && <View style={styles.activeDot} />}
        </Pressable>

        {/* 5. Profile & Settings (User / Avatar) */}
        <Pressable
          onPress={() => handleTabPress('profile')}
          hitSlop={moderateScale(8)}
          style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityState={{ selected: isProfileActive }}
          accessibilityLabel="User Profile and Settings"
        >
          {userAvatarUri ? (
            <View style={[styles.avatarContainer, isProfileActive && styles.avatarActive]}>
              <Image source={{ uri: userAvatarUri }} style={styles.avatarImage} />
            </View>
          ) : (
            <User
              size={NAV_CONSTANTS.iconSize}
              color={isProfileActive ? COLORS.navActive : COLORS.navInactive}
              strokeWidth={isProfileActive ? 2.5 : 1.9}
            />
          )}
          {isProfileActive && <View style={styles.activeDot} />}
        </Pressable>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: moderateScale(16),
    right: moderateScale(16),
    zIndex: 99,
    shadowColor: '#05142B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
  },
  fullWidthWrapper: {
    width: '100%',
  },
  floatingContainer: {
    height: NAV_CONSTANTS.barContentHeight,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(215, 230, 245, 0.95)',
    shadowColor: '#05142B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 14,
  },
  fullWidthContainer: {
    height: NAV_CONSTANTS.barContentHeight,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.navBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
  },
  tabButton: {
    flex: 1,
    height: NAV_CONSTANTS.barContentHeight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pressed: {
    opacity: 0.6,
  },
  activeDot: {
    position: 'absolute',
    bottom: moderateScale(6),
    width: moderateScale(4),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: COLORS.navActive,
  },
  fabSlot: {
    flex: 1,
    height: NAV_CONSTANTS.barContentHeight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  fabHalo: {
    position: 'absolute',
    top: -moderateScale(16),
    width: NAV_CONSTANTS.fabHaloSize,
    height: NAV_CONSTANTS.fabHaloSize,
    borderRadius: NAV_CONSTANTS.fabHaloSize / 2,
    backgroundColor: COLORS.navFabHalo,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: COLORS.white,
    shadowColor: '#05142B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
  fabButton: {
    width: NAV_CONSTANTS.fabInnerSize,
    height: NAV_CONSTANTS.fabInnerSize,
    borderRadius: NAV_CONSTANTS.fabInnerSize / 2,
    backgroundColor: COLORS.navFabBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.navFabBg,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.48,
    shadowRadius: 10,
    elevation: 10,
  },
  avatarContainer: {
    width: NAV_CONSTANTS.avatarSize,
    height: NAV_CONSTANTS.avatarSize,
    borderRadius: NAV_CONSTANTS.avatarSize / 2,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.navInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActive: {
    borderColor: COLORS.navActive,
    borderWidth: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});

export default BottomNavigation;
