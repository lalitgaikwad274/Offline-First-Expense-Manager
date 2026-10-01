import React, { memo, useCallback } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart3, Home, Plus, Receipt, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, moderateScale } from '../utils/constants';
import { SCREEN_NAMES } from '../utils/screenNames';
import { useAppDispatch } from '../store';
import { setActiveTab } from '../store/expenseSlice';

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
  barContentHeight: moderateScale(60),
  fabHaloSize: moderateScale(60),
  fabInnerSize: moderateScale(50),
  iconSize: moderateScale(23),
  avatarSize: moderateScale(28),
} as const;

export const BottomNavigation = memo(({
  activeTab = 'home',
  onTabPress,
  onAddPress,
  userAvatarUri,
  translateY,
  floating = false,
}: BottomNavigationProps) => {
  const navigation = useNavigation<any>();
  let insets = { bottom: 0 };
  try {
    insets = useSafeAreaInsets();
  } catch {
    insets = { bottom: Platform.OS === 'ios' ? moderateScale(16) : moderateScale(8) };
  }

  const dispatch = useAppDispatch();

  const handleTabPress = useCallback((tabId: TabId) => {
    dispatch(setActiveTab(tabId));

    if (onTabPress) {
      onTabPress(tabId);
      return;
    }

    if (tabId === activeTab) return;

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
  }, [activeTab, dispatch, navigation, onAddPress, onTabPress]);

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
            color={isHomeActive ? COLORS.navActive : '#4A5D78'}
            strokeWidth={isHomeActive ? 2 : 1.7}
          />
          <Text style={{ 
            fontSize: moderateScale(10),
            color: isHomeActive ? COLORS.navActive : '#4A5D78' }}>Home</Text>
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
            color={isTransactionsActive ? COLORS.navActive : '#4A5D78'}
            strokeWidth={isTransactionsActive ? 2 : 1.7}
          />
          <Text style={{ 
            fontSize: moderateScale(10),
            color: isTransactionsActive ? COLORS.navActive : '#4A5D78' }}>Transactions</Text>
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
                size={moderateScale(26)}
                color={COLORS.white}
                strokeWidth={2.3}
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
            color={isAnalyticsActive ? COLORS.navActive : '#4A5D78'}
            strokeWidth={isAnalyticsActive ? 2 : 1.7}
          />
           <Text style={{ 
            fontSize: moderateScale(10),
            color: isAnalyticsActive ? COLORS.navActive : '#4A5D78' }}>Analytics</Text>
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
              color={isProfileActive ? COLORS.navActive : '#4A5D78'}
              strokeWidth={isProfileActive ? 2 : 1.7}
            />
          )}
           <Text style={{ 
            fontSize: moderateScale(10),
            color: isProfileActive ? COLORS.navActive : '#4A5D78' }}>Profile</Text>
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 16,
  },
  fullWidthWrapper: {
    width: '100%',
  },
  floatingContainer: {
    height: NAV_CONSTANTS.barContentHeight,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: moderateScale(30),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(12),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 1)',
    shadowColor: '#05142B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 16,
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
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(2.5),
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
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#05142B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 10,
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
    borderColor: '#4A5D78',
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
