import React, { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BarChart3, Home, List, User } from 'lucide-react-native';
import { COLORS, SHADOWS, moderateScale } from '../utils/constants';

export interface TabItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
}

export const DEFAULT_TABS: TabItem[] = [
  {
    id: 'home',
    title: 'Home',
    icon: Home,
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: List,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
  },
  {
    id: 'profile',
    title: 'Profile',
    icon: User,
  },
];

export interface BottomNavigationProps {
  activeTab: string;
  tabs?: TabItem[];
  onTabPress?: (id: string) => void;
}

export const BottomNavigation = memo(({
  activeTab,
  tabs = DEFAULT_TABS,
  onTabPress,
}: BottomNavigationProps) => {
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabPress?.(tab.id)}
            style={({ pressed }) => [
              styles.tabItem,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.title}
          >
            <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
              <Icon
                size={moderateScale(24)}
                color={active ? COLORS.expense : COLORS.navy}
                strokeWidth={active ? 2.6 : 2}
              />
            </View>

            <Text
              style={[
                styles.tabText,
                active && styles.tabTextActive,
              ]}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: moderateScale(78),
    paddingTop: moderateScale(8),
    paddingBottom: Platform.OS === 'ios' ? moderateScale(16) : moderateScale(8),
    backgroundColor: 'rgba(247, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(170, 200, 202, 0.25)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    transform: [{ scale: 1.05 }],
  },
  tabText: {
    color: COLORS.navy,
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginTop: moderateScale(4),
  },
  tabTextActive: {
    color: COLORS.expense,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
});

export default BottomNavigation;
