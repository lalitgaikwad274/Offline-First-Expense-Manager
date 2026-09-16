import React, { memo } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BarChart3, CloudOff, CreditCard, Database, Grid2x2, Home, Receipt, Settings, ShieldCheck, Sparkles, Wallet, Wifi, X } from 'lucide-react-native';
import { COLORS, SHADOWS, moderateScale, wp } from '../utils/constants';
import { UserProfile } from '../types/expense';

export interface DrawerNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onSelectItem?: (id: string) => void;
  user?: UserProfile;
  isOffline?: boolean;
  onToggleOffline?: () => void;
  totalExpensesCount?: number;
}

interface DrawerMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  badge?: string;
}

const MENU_ITEMS: DrawerMenuItem[] = [
  {
    id: 'home',
    label: 'Dashboard Overview',
    icon: Home,
  },
  {
    id: 'transactions',
    label: 'Transactions Ledger',
    icon: Receipt,
  },
  {
    id: 'analytics',
    label: 'Analytics & Insights',
    icon: BarChart3,
  },
  {
    id: 'categories',
    label: 'Expense Categories',
    icon: Grid2x2,
  },
  {
    id: 'cards',
    label: 'Wallets & Accounts',
    icon: CreditCard,
  },
  {
    id: 'database',
    label: 'Offline Database',
    icon: Database,
    badge: 'SQLite',
  },
  {
    id: 'settings',
    label: 'App Settings',
    icon: Settings,
  },
  {
    id: 'security',
    label: 'Security & Backup',
    icon: ShieldCheck,
  },
];

export const DrawerNavigation = memo(({
  isOpen,
  onClose,
  activeItem = 'home',
  onSelectItem,
  user,
  isOffline = false,
  onToggleOffline,
  totalExpensesCount = 3,
}: DrawerNavigationProps) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop dismiss pressable */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel="Close Drawer"
        />

        {/* Drawer Content Panel */}
        <View style={styles.drawerContainer}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Drawer Header with Logo and Close Button */}
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <LinearGradient
                  colors={COLORS.gradientPrimary}
                  style={styles.brandLogo}
                >
                  <Wallet size={moderateScale(20)} color={COLORS.white} strokeWidth={2.4} />
                </LinearGradient>
                <View>
                  <View style={styles.brandTitleRow}>
                    <Text style={styles.brandTitle}>Expensio</Text>
                    <Sparkles size={moderateScale(13)} color={COLORS.primary} />
                  </View>
                  <Text style={styles.brandSubtitle}>Offline-First Manager</Text>
                </View>
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
              >
                <X size={moderateScale(22)} color={COLORS.navy} strokeWidth={2.4} />
              </Pressable>
            </View>

            {/* User Profile Card */}
            <View style={styles.userCard}>
              <LinearGradient
                colors={COLORS.gradientAvatar}
                style={styles.userAvatar}
              >
                <Text style={styles.avatarText}>{user?.initials || 'L'}</Text>
              </LinearGradient>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'Lalit Gaikwad'}</Text>
                <Text style={styles.userRole}>
                  {totalExpensesCount} active records
                </Text>
              </View>
            </View>

            {/* Offline Status Toggle Row */}
            {/* <View style={styles.offlineToggleRow}>
              <View style={styles.offlineToggleLeft}>
                {isOffline ? (
                  <CloudOff size={moderateScale(18)} color={COLORS.expense} strokeWidth={2.2} />
                ) : (
                  <Wifi size={moderateScale(18)} color={COLORS.income} strokeWidth={2.2} />
                )}
                <View style={styles.offlineTextContainer}>
                  <Text style={styles.offlineTitle}>
                    {isOffline ? 'Offline Mode' : 'Online Sync'}
                  </Text>
                  <Text style={styles.offlineDesc}>
                    {isOffline ? 'Sync paused (local db)' : 'Auto-sync active'}
                  </Text>
                </View>
              </View>
              <Switch
                value={!isOffline}
                onValueChange={onToggleOffline}
                trackColor={{ false: '#FFCDD2', true: '#B9F6CA' }}
                thumbColor={isOffline ? COLORS.expense : COLORS.income}
                ios_backgroundColor="#E0E0E0"
              />
            </View> */}

            {/* Menu Items List */}
            <View style={styles.menuSection}>
              <Text style={styles.sectionLabel}>NAVIGATION</Text>
              {MENU_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      onSelectItem?.(item.id);
                      onClose();
                    }}
                    style={({ pressed }) => [
                      styles.menuItem,
                      isActive && styles.menuItemActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.menuIconWrapper,
                        isActive && styles.menuIconWrapperActive,
                      ]}
                    >
                      <Icon
                        size={moderateScale(20)}
                        color={isActive ? COLORS.white : COLORS.navy}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </View>

                    <Text
                      style={[
                        styles.menuItemText,
                        isActive && styles.menuItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Expensio v1.0.0 (Offline-First)</Text>
              <Text style={styles.footerSub}>Encrypted Local Storage</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(7, 27, 58, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  drawerContainer: {
    width: Math.min(wp(80), 320),
    height: '100%',
    backgroundColor: COLORS.surface,
    paddingTop: Platform.OS === 'ios' ? moderateScale(48) : moderateScale(24),
    paddingBottom: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    ...SHADOWS.medium,
  },
  scrollContent: {
    flexGrow: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: moderateScale(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: moderateScale(14),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  brandLogo: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  brandTitle: {
    fontSize: moderateScale(16),
    fontWeight: '900',
    color: COLORS.navy,
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: COLORS.primary,
  },
  closeButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(219, 245, 248, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: moderateScale(12),
    borderRadius: moderateScale(18),
    marginBottom: moderateScale(14),
    ...SHADOWS.soft,
  },
  userAvatar: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: moderateScale(18),
    fontWeight: '900',
    color: COLORS.navy,
  },
  userInfo: {
    marginLeft: moderateScale(12),
    flex: 1,
  },
  userName: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: COLORS.navy,
  },
  userRole: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 2,
  },
  offlineToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(235, 252, 253, 0.9)',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(14),
    marginBottom: moderateScale(16),
  },
  offlineToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    flex: 1,
  },
  offlineTextContainer: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.navy,
  },
  offlineDesc: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    color: COLORS.gray,
  },
  menuSection: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 0.8,
    marginBottom: moderateScale(8),
    marginLeft: moderateScale(6),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(14),
    marginBottom: moderateScale(4),
  },
  menuItemActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.soft,
  },
  menuIconWrapper: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(219, 245, 248, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconWrapperActive: {
    backgroundColor: COLORS.primary,
  },
  menuItemText: {
    marginLeft: moderateScale(12),
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.navy,
    flex: 1,
  },
  menuItemTextActive: {
    fontWeight: '800',
    color: COLORS.navy,
  },
  badge: {
    backgroundColor: 'rgba(8, 122, 166, 0.12)',
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(6),
  },
  badgeText: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    color: COLORS.primary,
  },
  footer: {
    marginTop: moderateScale(20),
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    alignItems: 'center',
  },
  footerText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: COLORS.gray,
  },
  footerSub: {
    fontSize: moderateScale(9),
    color: COLORS.lightGray,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.75,
  },
});

export default DrawerNavigation;
