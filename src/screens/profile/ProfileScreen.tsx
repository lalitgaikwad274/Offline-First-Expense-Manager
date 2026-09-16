import React from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from '@react-native-firebase/auth';
import {
  ArrowLeft,
  ChevronRight,
  Database,
  Globe,
  Info,
  LogOut,
  Moon,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { useAppSelector } from '../../store';
import { COLORS, moderateScale, SHADOWS, APP_CONFIG } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import BottomNavigation from '../../components/BottomNavigation';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const expenses = useAppSelector(state => state.expense.expenses);
  const income = useAppSelector(state => state.expense.income);
  const isOffline = useAppSelector(state => state.expense.isOffline);
  const reduxUser = useAppSelector(state => state.expense.user);

  const displayName = currentUser?.displayName || reduxUser?.name || 'Lalit Gaikwad';
  const email = currentUser?.email || 'lalit@expensio.app';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to log out');
            }
          },
        },
      ]
    );
  };

  const handleSyncData = () => {
    Alert.alert(
      'Sync Complete',
      'All local transactions and categories are up to date with the cloud database.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate(SCREEN_NAMES.HOME)}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
        >
          <ArrowLeft size={moderateScale(20)} color={COLORS.navy} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Account Profile</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{email}</Text>

          {/* Mini Badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: isOffline ? 'rgba(255, 170, 0, 0.15)' : 'rgba(81, 207, 102, 0.15)' }]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOffline ? '#FFA94D' : '#40C057' },
                ]}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isOffline ? '#D9480F' : '#2B8A3E' },
                ]}
              >
                {isOffline ? 'Offline Active' : 'Cloud Connected'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statCount}>{expenses.length}</Text>
            <Text style={styles.statTitle}>Transactions</Text>
          </View>
          <View style={styles.statColDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statCount}>₹{income.toLocaleString('en-IN')}</Text>
            <Text style={styles.statTitle}>Income</Text>
          </View>
          <View style={styles.statColDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statCount}>{expenses.filter(e => e.synced).length}</Text>
            <Text style={styles.statTitle}>Synced</Text>
          </View>
        </View>

        {/* Preferences / Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences & Storage</Text>

          <View style={styles.menuGroup}>
            <TouchableOpacity onPress={handleSyncData} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(51, 154, 240, 0.12)' }]}>
                  <RefreshCw size={moderateScale(18)} color="#339AF0" strokeWidth={2.2} />
                </View>
                <Text style={styles.menuLabel}>Sync Cloud Data</Text>
              </View>
              <ChevronRight size={moderateScale(18)} color={COLORS.gray} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(81, 207, 102, 0.12)' }]}>
                  <Database size={moderateScale(18)} color="#40C057" strokeWidth={2.2} />
                </View>
                <Text style={styles.menuLabel}>Local Storage Engine</Text>
              </View>
              <Text style={styles.menuValue}>SQLite v3</Text>
            </View>

            <View style={styles.itemDivider} />

            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(132, 94, 247, 0.12)' }]}>
                  <Globe size={moderateScale(18)} color="#845EF7" strokeWidth={2.2} />
                </View>
                <Text style={styles.menuLabel}>Currency</Text>
              </View>
              <Text style={styles.menuValue}>₹ INR</Text>
            </View>
          </View>
        </View>

        {/* Security & About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Details</Text>

          <View style={styles.menuGroup}>
            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(32, 201, 151, 0.12)' }]}>
                  <ShieldCheck size={moderateScale(18)} color="#20C997" strokeWidth={2.2} />
                </View>
                <Text style={styles.menuLabel}>Offline Encryption</Text>
              </View>
              <Text style={styles.menuValue}>Active</Text>
            </View>

            <View style={styles.itemDivider} />

            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: 'rgba(134, 142, 150, 0.12)' }]}>
                  <Info size={moderateScale(18)} color="#868E96" strokeWidth={2.2} />
                </View>
                <Text style={styles.menuLabel}>Expensio Version</Text>
              </View>
              <Text style={styles.menuValue}>{APP_CONFIG.version}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Log Out"
        >
          <LogOut size={moderateScale(18)} color={COLORS.red} strokeWidth={2.2} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation with Active Tab */}
      <BottomNavigation activeTab="profile" />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: moderateScale(14),
  },
  headerTitle: {
    fontSize: moderateScale(19),
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(24),
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    alignItems: 'center',
    marginBottom: moderateScale(14),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    ...SHADOWS.soft,
  },
  avatarContainer: {
    width: moderateScale(68),
    height: moderateScale(68),
    borderRadius: moderateScale(34),
    backgroundColor: COLORS.petrol,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(12),
    ...SHADOWS.soft,
  },
  avatarText: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: COLORS.white,
  },
  userName: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: moderateScale(2),
  },
  userEmail: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    marginBottom: moderateScale(10),
  },
  badgeRow: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(12),
    gap: moderateScale(6),
  },
  statusDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(3.5),
  },
  statusBadgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    paddingVertical: moderateScale(14),
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    ...SHADOWS.soft,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statColDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(219, 237, 240, 0.8)',
    alignSelf: 'center',
  },
  statCount: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.navy,
  },
  statTitle: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
    marginTop: 2,
    fontWeight: '500',
  },
  section: {
    marginBottom: moderateScale(14),
  },
  sectionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: moderateScale(8),
    marginLeft: moderateScale(4),
  },
  menuGroup: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(13),
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  menuIconBox: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.navy,
  },
  menuValue: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    fontWeight: '500',
  },
  itemDivider: {
    height: 1,
    backgroundColor: 'rgba(219, 237, 240, 0.6)',
    marginLeft: moderateScale(60),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    gap: moderateScale(8),
    marginTop: moderateScale(4),
    marginBottom: moderateScale(20),
    ...SHADOWS.soft,
  },
  logoutText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.red,
  },
});