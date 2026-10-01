import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Rect,
} from 'react-native-svg';
import {
  ArrowLeft,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Folder,
  Gamepad2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  X,
  Zap,
} from 'lucide-react-native';
import { useAppDispatch } from '../../store';
import { addExpense } from '../../store/expenseSlice';
import { COLORS, moderateScale } from '../../utils/constants';
import {
  checkSmsPermission,
  getLastSmsFetchDate,
  getSmsTransactions,
  RawSms,
  requestSmsPermission,
  setLastSmsFetchDate,
} from '../../services/smsService';

// --- Types ---
export type NotificationTab = 'pending' | 'accepted' | 'rejected';

export interface TransactionNotification {
  id: string;
  bankName: string;
  bankCode: 'hdfc' | 'icici' | 'sbi' | 'axis' | 'other';
  amount: number;
  payee: string;
  category: 'Food & Dining' | 'Shopping' | 'Utilities' | 'Transport' | 'Entertainment' | 'Other';
  time: string;
  dateGroup: 'Today' | 'Yesterday' | 'Earlier';
  status: 'pending' | 'accepted' | 'rejected';
  source: 'SMS' | 'Notification' | 'Auto';
  rawBody?: string;
  rawAddress?: string;
  timestamp?: number;
}

// --- Bank & Merchant Logos ---

// 1. HDFC Bank Logo
const HDFCLogo = ({ size = 42 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 42 42">
    <Rect width="42" height="42" rx="10" fill="#ED232A" />
    <Rect x="7" y="7" width="28" height="28" rx="3" fill="#FFFFFF" />
    <Rect x="16" y="7" width="10" height="28" fill="#004C8F" />
    <Rect x="7" y="16" width="28" height="10" fill="#004C8F" />
    <Rect x="16" y="16" width="10" height="10" fill="#ED232A" />
  </Svg>
);

// 2. Amazon Logo
const AmazonLogo = ({ size = 42 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 42 42">
    <Rect width="42" height="42" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    {/* Stylized Amazon 'a' */}
    <Path
      d="M20.5 13.5C17.5 13.5 15 15 14.5 17.5H17C17.4 16.3 18.5 15.5 20.3 15.5C22.3 15.5 23.5 16.5 23.5 18.2V19.3C22.8 19 21.6 18.8 20 18.8C16.5 18.8 14 20.5 14 23.3C14 25.7 15.8 27 18.3 27C20.5 27 22.2 26 23.2 24.5V26.8H25.8V18.5C25.8 15.1 23.6 13.5 20.5 13.5ZM20.2 25C18.6 25 16.8 24.3 16.8 23C16.8 21.5 18.3 20.7 20.5 20.7C21.7 20.7 22.7 21 23.4 21.3C23.2 23.7 21.8 25 20.2 25Z"
      fill="#111827"
    />
    {/* Orange smile curve */}
    <Path
      d="M12 28.5C16 31.8 23.5 31.8 28.5 27.5"
      stroke="#FF9900"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />
    <Path d="M26.8 26.2L29.8 27.5L27.8 30.2" fill="#FF9900" />
  </Svg>
);

// 3. Swiggy Logo
const SwiggyLogo = ({ size = 42 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 42 42">
    <Rect width="42" height="42" rx="10" fill="#FC8019" />
    <Path
      d="M21 9C16 9 12 13 12 18C12 24 20 32.5 20.5 33C20.8 33.3 21.2 33.3 21.5 33C22 32.5 30 24 30 18C30 13 26 9 21 9ZM21 21.5C19 21.5 17.5 20 17.5 18C17.5 16 19 14.5 21 14.5C23 14.5 24.5 16 24.5 18C24.5 20 23 21.5 21 21.5Z"
      fill="#FFFFFF"
    />
    <Path
      d="M19 18C19 16.5 20 15.5 21.5 15.5C22.8 15.5 23.8 16.2 24 17.5H22.5C22.4 16.9 22 16.6 21.5 16.6C20.8 16.6 20.3 17.1 20.3 17.8C20.3 19.8 24 19.3 24 21.8C24 23.2 22.8 24 21.3 24C19.8 24 18.8 23.1 18.6 21.8H20.1C20.2 22.5 20.7 22.9 21.4 22.9C22.2 22.9 22.6 22.4 22.6 21.8C22.6 19.9 19 20.2 19 18Z"
      fill="#FC8019"
    />
  </Svg>
);

// 4. Google Play Logo
const GooglePlayLogo = ({ size = 42 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 42 42">
    <Rect width="42" height="42" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
    <G transform="translate(4, 3)">
      <Path d="M9 8.5L20.5 18L9 27.5V8.5Z" fill="#4285F4" />
      <Path d="M20.5 18L9 8.5L23.5 16.2L20.5 18Z" fill="#34A853" />
      <Path d="M26 17.5L23.5 16.2L20.5 18L23.5 19.8L26 17.5Z" fill="#FBBC05" />
      <Path d="M9 27.5L20.5 18L23.5 19.8L9 27.5Z" fill="#EA4335" />
    </G>
  </Svg>
);

// 5. ICICI Bank Logo
const ICICILogo = ({ size = 42 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 42 42">
    <Rect width="42" height="42" rx="10" fill="#FFFFFF" stroke="#F1F5F9" strokeWidth="1" />
    <Path
      d="M26 13C23.5 11 18.5 11 15 13.5C11.5 16.5 10.5 22 12.5 26.5C14.5 30.5 19.5 31.5 23.5 29.5C26.5 28 27.5 25 27 22C26.5 19.5 23.8 18.5 21.5 19.5C19.5 20.5 18.5 22.5 17.5 21.5C16.5 20.5 16.5 18 17.5 16C18.5 14 21 13 23 13.5"
      stroke="#B3282D"
      strokeWidth="3.2"
      strokeLinecap="round"
      fill="none"
    />
    <Circle cx="24.5" cy="19" r="3.2" fill="#F37021" />
  </Svg>
);

// 6. SBI Bank Logo
const SBILogo = ({ size = 42 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 42 42">
    <Circle cx="21" cy="21" r="20" fill="#0B71B9" />
    <Circle cx="21" cy="17.5" r="5" fill="#FFFFFF" />
    <Rect x="19" y="17.5" width="4" height="16" fill="#FFFFFF" />
  </Svg>
);

// 7. Axis Bank Logo
const AxisLogo = ({ size = 42 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 42 42">
    <Rect width="42" height="42" rx="10" fill="#97144D" />
    <Path d="M12 30L21 12L30 30H25.5L21 22.5L16.5 30H12Z" fill="#FFFFFF" />
  </Svg>
);

const BankLogo: React.FC<{ code: string; payee?: string; bankName?: string; size?: number }> = ({
  code,
  payee = '',
  bankName = '',
  size = 42,
}) => {
  const combined = `${bankName} ${payee}`.toLowerCase();
  if (combined.includes('amazon')) {
    return <AmazonLogo size={size} />;
  }
  if (combined.includes('swiggy') || combined.includes('zomato')) {
    return <SwiggyLogo size={size} />;
  }
  if (combined.includes('google') || combined.includes('play')) {
    return <GooglePlayLogo size={size} />;
  }

  switch (code) {
    case 'hdfc':
      return <HDFCLogo size={size} />;
    case 'icici':
      return <ICICILogo size={size} />;
    case 'sbi':
      return <SBILogo size={size} />;
    case 'axis':
      return <AxisLogo size={size} />;
    default:
      return <HDFCLogo size={size} />;
  }
};

// --- Review Banner Illustration (Lavender Envelope with Purple Magnifying Glass) ---
const ReviewBannerIllustration = ({ size = 52 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="28" fill="#EDE9FE" opacity="0.65" />
    <Rect
      x="8"
      y="18"
      width="40"
      height="28"
      rx="6"
      fill="#E9D5FF"
      stroke="#C084FC"
      strokeWidth="1.2"
    />
    <Rect
      x="12"
      y="11"
      width="32"
      height="24"
      rx="4"
      fill="#FFFFFF"
      stroke="#DDD6FE"
      strokeWidth="1"
    />
    <Rect x="17" y="16" width="16" height="2.5" rx="1.25" fill="#9333EA" />
    <Rect x="17" y="21" width="22" height="2" rx="1" fill="#D8B4FE" />
    <Rect x="17" y="25" width="18" height="2" rx="1" fill="#E9D5FF" />
    <Path
      d="M8 20L26 33C27.2 33.9 28.8 33.9 30 33L48 20"
      stroke="#C084FC"
      strokeWidth="1.2"
      fill="none"
    />
    <Path d="M8 44L22 32" stroke="#D8B4FE" strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M48 44L34 32" stroke="#D8B4FE" strokeWidth="1.2" strokeLinecap="round" />
    <Circle
      cx="43"
      cy="41"
      r="9"
      fill="#F5F3FF"
      stroke="#7C3AED"
      strokeWidth="3.2"
    />
    <Line
      x1="49.5"
      y1="47.5"
      x2="57.5"
      y2="55.5"
      stroke="#7C3AED"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <Circle cx="50" cy="14" r="1.6" fill="#A855F7" />
    <Circle cx="10" cy="13" r="1.4" fill="#C084FC" />
    <Circle cx="22" cy="7" r="1.6" fill="#7C3AED" />
  </Svg>
);

// --- Three Vertical Dots Icon ---
const MoreVerticalIcon = ({ size = 20, color = '#087A9F' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="2.2" fill={color} />
    <Circle cx="12" cy="12" r="2.2" fill={color} />
    <Circle cx="12" cy="19" r="2.2" fill={color} />
  </Svg>
);

// --- SMS Speech Bubble Icon ---
const SmsMessageIcon = ({ size = 12, color = '#7C3AED' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Rect x="1" y="2" width="14" height="10" rx="2.5" fill={color} />
    <Path d="M4 12L3 14.5L6.5 12H4Z" fill={color} />
    <Circle cx="4.8" cy="7" r="1.1" fill="#FFFFFF" />
    <Circle cx="8" cy="7" r="1.1" fill="#FFFFFF" />
    <Circle cx="11.2" cy="7" r="1.1" fill="#FFFFFF" />
  </Svg>
);

// --- Category Badge Component ---
const CategoryBadge: React.FC<{ category: TransactionNotification['category'] }> = ({
  category,
}) => {
  let icon = <Folder size={12} color="#475569" strokeWidth={2.4} />;
  let label = category;
  let bg = '#F1F5F9';
  let textColor = '#475569';

  switch (category) {
    case 'Other':
      icon = <Folder size={12} color="#64748B" strokeWidth={2.4} />;
      bg = '#F1F5F9';
      textColor = '#475569';
      break;
    case 'Shopping':
      icon = <ShoppingBag size={12} color="#7C3AED" strokeWidth={2.4} />;
      bg = '#F5F3FF';
      textColor = '#7C3AED';
      break;
    case 'Food & Dining':
      icon = <Utensils size={12} color="#0D9488" strokeWidth={2.4} />;
      bg = '#E6FFFA';
      textColor = '#0D9488';
      break;
    case 'Entertainment':
      icon = <Gamepad2 size={12} color="#2563EB" strokeWidth={2.4} />;
      bg = '#EFF6FF';
      textColor = '#2563EB';
      break;
    case 'Utilities':
      icon = <Zap size={12} color="#EF4444" strokeWidth={2.4} />;
      bg = '#FEF2F2';
      textColor = '#EF4444';
      break;
    case 'Transport':
      icon = <Car size={12} color="#0D9488" strokeWidth={2.4} />;
      bg = '#F0FDFA';
      textColor = '#0D9488';
      break;
    default:
      icon = <Folder size={12} color="#64748B" strokeWidth={2.4} />;
      bg = '#F1F5F9';
      textColor = '#475569';
      break;
  }

  return (
    <View style={[styles.categoryBadge, { backgroundColor: bg }]}>
      {icon}
      <Text style={[styles.categoryText, { color: textColor }]}>{label}</Text>
    </View>
  );
};

// --- "From SMS" Pill Badge ---
const SmsBadge = () => (
  <View style={styles.smsBadge}>
    <SmsMessageIcon size={11} color="#7C3AED" />
    <Text style={styles.smsBadgeText}>From SMS</Text>
  </View>
);

// Currency formatter matching the screenshot
const formatAmount = (amt: number): string => {
  return amt.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(amt) ? (amt < 1000 ? 2 : 0) : 2,
    maximumFractionDigits: 2,
  });
};

interface DateGroupSection {
  dateKey: string;
  title: string;
  data: TransactionNotification[];
}

const getSectionDateLabel = (timestamp?: number): string => {
  if (!timestamp) return 'Earlier';

  const date = new Date(timestamp);
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

const formatLastFetchDate = (timestamp: number | null): string => {
  if (!timestamp || timestamp <= 0) {
    return 'Not synced yet';
  }

  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  const timeStr = `${hours}:${minStr} ${ampm}`;

  if (isToday) {
    return `Today, ${timeStr}`;
  }

  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${day} ${months[date.getMonth()]}`;
  return `${dateStr}, ${timeStr}`;
};

// Initial mock transactions reproducing the user's screenshot with 26 total transactions
const getInitialMockNotifications = (): TransactionNotification[] => {
  const items: TransactionNotification[] = [
    // 14 Oct 2025 (1 transaction)
    {
      id: 'sms-demo-1',
      bankName: 'HDFC Bank',
      bankCode: 'hdfc',
      amount: 100000,
      payee: 'LALIT MANOHAR GAIKWAD',
      category: 'Other',
      time: '5:38 PM',
      dateGroup: 'Today',
      status: 'pending',
      source: 'SMS',
      rawBody: 'HDFC Bank: Rs 1,00,000.00 debited from A/C **4120 on 14-Oct-25 to LALIT MANOHAR GAIKWAD. Avl Bal: Rs 2,42,180.50.',
      timestamp: new Date('2025-10-14T17:38:00').getTime(),
    },
    // 13 Oct 2025 (1 transaction)
    {
      id: 'sms-demo-2',
      bankName: 'Amazon',
      bankCode: 'other',
      amount: 23394.22,
      payee: 'GUR',
      category: 'Shopping',
      time: '11:44 PM',
      dateGroup: 'Today',
      status: 'pending',
      source: 'SMS',
      rawBody: 'ICICI Bank: Acct XX902 debited for Rs 23,394.22 on 13-Oct-25 at Amazon GUR. UPI Ref 32918291.',
      timestamp: new Date('2025-10-13T23:44:00').getTime(),
    },
    // 12 Oct 2025 (3 transactions)
    {
      id: 'sms-demo-3',
      bankName: 'Swiggy',
      bankCode: 'other',
      amount: 489.0,
      payee: 'ZOMATO MEDIA PVT LTD',
      category: 'Food & Dining',
      time: '8:21 AM',
      dateGroup: 'Yesterday',
      status: 'pending',
      source: 'SMS',
      rawBody: 'HDFC Bank: Rs 489.00 debited for order at Swiggy / ZOMATO MEDIA PVT LTD on 12-Oct-25.',
      timestamp: new Date('2025-10-12T08:21:00').getTime(),
    },
    {
      id: 'sms-demo-4',
      bankName: 'Google Play',
      bankCode: 'other',
      amount: 149.0,
      payee: 'GOOGLE INDIA DIGITAL',
      category: 'Entertainment',
      time: '8:12 AM',
      dateGroup: 'Yesterday',
      status: 'pending',
      source: 'SMS',
      rawBody: 'SBI Bank: Rs 149.00 debited towards Google Play GOOGLE INDIA DIGITAL on 12-Oct-25.',
      timestamp: new Date('2025-10-12T08:12:00').getTime(),
    },
    {
      id: 'sms-demo-5',
      bankName: 'Uber',
      bankCode: 'other',
      amount: 220.0,
      payee: 'UBER INDIA SYSTEMS',
      category: 'Transport',
      time: '7:45 AM',
      dateGroup: 'Yesterday',
      status: 'pending',
      source: 'SMS',
      rawBody: 'HDFC Bank: Rs 220.00 debited for Uber ride on 12-Oct-25.',
      timestamp: new Date('2025-10-12T07:45:00').getTime(),
    },
  ];

  // Add 21 additional pending transactions to total 26 pending transactions as shown in screenshot
  const extraMerchants = [
    { name: 'Starbucks', payee: 'TATA STARBUCKS PVT LTD', amt: 395.0, cat: 'Food & Dining' as const },
    { name: 'Flipkart', payee: 'FLIPKART INTERNET', amt: 1299.0, cat: 'Shopping' as const },
    { name: 'Netflix', payee: 'NETFLIX ENTERTAINMENT', amt: 649.0, cat: 'Entertainment' as const },
    { name: 'Jio Prepaid', payee: 'RELIANCE JIO INFOCOMM', amt: 299.0, cat: 'Utilities' as const },
    { name: 'BookMyShow', payee: 'BIGTREE ENTERTAINMENT', amt: 720.0, cat: 'Entertainment' as const },
    { name: 'Blinkit', payee: 'BLINK COMMERCE PVT LTD', amt: 540.0, cat: 'Food & Dining' as const },
    { name: 'Zomato', payee: 'ZOMATO RESTAURANTS', amt: 620.0, cat: 'Food & Dining' as const },
  ];

  for (let i = 6; i <= 26; i++) {
    const m = extraMerchants[(i - 6) % extraMerchants.length];
    const dayOffset = Math.floor((i - 6) / 3) + 3; // 11 Oct, 10 Oct, etc.
    const dateNum = Math.max(1, 12 - dayOffset);
    const dayStr = dateNum < 10 ? `0${dateNum}` : `${dateNum}`;
    items.push({
      id: `sms-demo-${i}`,
      bankName: m.name,
      bankCode: 'other',
      amount: m.amt,
      payee: m.payee,
      category: m.cat,
      time: '4:15 PM',
      dateGroup: 'Earlier',
      status: 'pending',
      source: 'SMS',
      rawBody: `Alert: Rs ${m.amt} spent on ${dayStr}-Oct-25 at ${m.payee}.`,
      timestamp: new Date(`2025-10-${dayStr}T16:15:00`).getTime(),
    });
  }

  return items;
};

export const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  // Screen State initialized with 26 transactions matching screenshot
  const [notifications, setNotifications] = useState<TransactionNotification[]>(getInitialMockNotifications);
  const [activeTab, setActiveTab] = useState<NotificationTab>('pending');
  const [menuVisible, setMenuVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isScanningSms, setIsScanningSms] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingNew, setIsFetchingNew] = useState(false);
  const [hasSmsPermission, setHasSmsPermission] = useState<boolean | null>(null);
  const [isRealSmsSource, setIsRealSmsSource] = useState(false);
  const [lastFetchDate, setLastFetchDate] = useState<number | null>(null);

  // Confirmation Dialog State for Reject and Accept
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    type: 'accept' | 'reject';
    item: TransactionNotification | null;
  }>({
    visible: false,
    type: 'accept',
    item: null,
  });

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Fetch transactions from device SMS (initial or full rescan)
  const loadSmsTransactions = useCallback(
    async (isPullToRefresh = false, isFullScan = false) => {
      if (isPullToRefresh) {
        setIsRefreshing(true);
      } else {
        setIsScanningSms(true);
      }

      try {
        const result = await getSmsTransactions({
          maxCount: 200,
          updateLastFetchDate: true,
        });
        setHasSmsPermission(result.permissionGranted);
        setIsRealSmsSource(result.isRealDevice && result.permissionGranted);

        if (result.fetchDate) {
          setLastFetchDate(result.fetchDate);
        }

        if (result.transactions && result.transactions.length > 0) {
          setNotifications(prev => {
            const statusMap = new Map(prev.map(p => [p.id, p.status]));
            const merged = result.transactions.map(item => ({
              ...item,
              status: statusMap.get(item.id) || item.status,
            }));
            return merged;
          });

          if (isPullToRefresh || isFullScan) {
            showToast(`Found ${result.transactions.length} transactions from SMS inbox`);
          }
        }
      } catch (err) {
        console.warn('Failed to load SMS transactions:', err);
      } finally {
        setIsScanningSms(false);
        setIsRefreshing(false);
      }
    },
    [showToast]
  );

  // Fetch only transactions arrived AFTER the last fetch date (Incremental Fetch)
  const handleFetchAfterLastSync = useCallback(async () => {
    if (isFetchingNew) return;
    setIsFetchingNew(true);

    try {
      let effectiveSinceDate = lastFetchDate;
      if (!effectiveSinceDate || effectiveSinceDate <= 0) {
        const saved = await getLastSmsFetchDate();
        if (saved > 0) {
          effectiveSinceDate = saved;
        }
      }

      const result = await getSmsTransactions({
        sinceTimestamp: effectiveSinceDate && effectiveSinceDate > 0 ? effectiveSinceDate : undefined,
        updateLastFetchDate: true,
      });

      setHasSmsPermission(result.permissionGranted);
      setIsRealSmsSource(result.isRealDevice && result.permissionGranted);

      if (result.fetchDate) {
        setLastFetchDate(result.fetchDate);
      }

      if (result.transactions && result.transactions.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newOnly = result.transactions.filter(t => !existingIds.has(t.id));
          if (newOnly.length === 0) return prev;
          return [...newOnly, ...prev];
        });

        showToast(
          `🎉 Found ${result.transactions.length} new transaction${result.transactions.length > 1 ? 's' : ''} after last sync!`
        );
      } else {
        const formattedTime = effectiveSinceDate ? formatLastFetchDate(effectiveSinceDate) : 'earlier';
        showToast(`Inbox up to date. No new bank SMS since ${formattedTime}.`);
      }
    } catch (err) {
      console.warn('Failed to fetch new SMS transactions:', err);
      showToast('Could not fetch new SMS.');
    } finally {
      setIsFetchingNew(false);
    }
  }, [isFetchingNew, lastFetchDate, showToast]);

  // Load saved last fetch date and run initial SMS check
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const savedDate = await getLastSmsFetchDate();
      if (isMounted && savedDate > 0) {
        setLastFetchDate(savedDate);
      } else if (isMounted) {
        setLastFetchDate(new Date('2025-10-14T17:38:00').getTime());
      }
      loadSmsTransactions();
    })();
    return () => {
      isMounted = false;
    };
  }, [loadSmsTransactions]);

  // Reset sync date and do full rescan
  const handleResetSyncDate = useCallback(async () => {
    await setLastSmsFetchDate(0);
    setLastFetchDate(null);
    setMenuVisible(false);
    showToast('Reset sync date. Rescanning all SMS...');
    loadSmsTransactions(true, true);
  }, [loadSmsTransactions, showToast]);

  // Request SMS permission manually
  const handleRequestPermission = useCallback(async () => {
    const granted = await requestSmsPermission();
    setHasSmsPermission(granted);
    if (granted) {
      showToast('SMS permission granted! Scanning inbox...');
      loadSmsTransactions(true);
    } else {
      showToast('SMS permission denied.');
    }
  }, [loadSmsTransactions, showToast]);

  // Filtered lists
  const pendingItems = useMemo(
    () => notifications.filter(item => item.status === 'pending'),
    [notifications]
  );
  const acceptedItems = useMemo(
    () => notifications.filter(item => item.status === 'accepted'),
    [notifications]
  );
  const rejectedItems = useMemo(
    () => notifications.filter(item => item.status === 'rejected'),
    [notifications]
  );

  const pendingCount = pendingItems.length;

  // Items to display based on active tab
  const displayedItems = useMemo(() => {
    if (activeTab === 'pending') return pendingItems;
    if (activeTab === 'accepted') return acceptedItems;
    return rejectedItems;
  }, [activeTab, pendingItems, acceptedItems, rejectedItems]);

  // Group transactions date-wise, ordered chronologically newest first
  const groupedDateSections = useMemo<DateGroupSection[]>(() => {
    const sorted = [...displayedItems].sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    const map = new Map<string, { title: string; data: TransactionNotification[] }>();

    for (const item of sorted) {
      const ts = item.timestamp || Date.now();
      const d = new Date(ts);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const title = getSectionDateLabel(ts);

      if (!map.has(dateKey)) {
        map.set(dateKey, {
          title,
          data: [],
        });
      }

      map.get(dateKey)!.data.push(item);
    }

    return Array.from(map.entries()).map(([dateKey, group]) => ({
      dateKey,
      title: group.title,
      data: group.data,
    }));
  }, [displayedItems]);

  // Actions
  const handleAccept = useCallback(
    (item: TransactionNotification) => {
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, status: 'accepted' } : n))
      );

      try {
        const categoryMap: Record<string, any> = {
          'Food & Dining': 'Food & Dining',
          'Shopping': 'Shopping',
          'Utilities': 'Bills & Utilities',
          'Transport': 'Transport',
          'Entertainment': 'Entertainment',
        };
        dispatch(
          addExpense({
            id: `exp-${Date.now()}`,
            title: item.payee,
            amount: item.amount,
            category: categoryMap[item.category] || 'Other',
            date: new Date().toISOString(),
            notes: `Auto-detected from ${item.bankName} SMS`,
            synced: false,
          })
        );
      } catch (err) {
        console.warn('Failed to dispatch addExpense:', err);
      }

      showToast(`✓ Added ₹${formatAmount(item.amount)} (${item.payee}) to expenses!`);
    },
    [dispatch, showToast]
  );

  const handleReject = useCallback(
    (item: TransactionNotification) => {
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, status: 'rejected' } : n))
      );
      showToast(`Transaction for ${item.payee} rejected`);
    },
    [showToast]
  );

  // Trigger confirmation modal for Accept
  const promptAccept = useCallback((item: TransactionNotification) => {
    setConfirmDialog({
      visible: true,
      type: 'accept',
      item,
    });
  }, []);

  // Trigger confirmation modal for Reject
  const promptReject = useCallback((item: TransactionNotification) => {
    setConfirmDialog({
      visible: true,
      type: 'reject',
      item,
    });
  }, []);

  // Execute confirmed action
  const handleConfirmAction = useCallback(() => {
    if (!confirmDialog.item) {
      setConfirmDialog(prev => ({ ...prev, visible: false }));
      return;
    }

    const { type, item } = confirmDialog;
    setConfirmDialog({ visible: false, type: 'accept', item: null });

    if (type === 'accept') {
      handleAccept(item);
    } else {
      handleReject(item);
    }
  }, [confirmDialog, handleAccept, handleReject]);

  const handleRestoreToPending = useCallback(
    (item: TransactionNotification) => {
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, status: 'pending' } : n))
      );
      showToast(`Moved ${item.payee} back to Pending`);
    },
    [showToast]
  );

  const handleAcceptAll = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => (n.status === 'pending' ? { ...n, status: 'accepted' } : n))
    );
    setMenuVisible(false);
    showToast('All pending transactions accepted!');
  }, [showToast]);

  const handleRejectAll = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => (n.status === 'pending' ? { ...n, status: 'rejected' } : n))
    );
    setMenuVisible(false);
    showToast('All pending transactions rejected');
  }, [showToast]);

  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
    setMenuVisible(false);
    showToast('Notifications cleared');
  }, [showToast]);

  // Render a Single Transaction Card (matching the screenshot)
  const renderCard = (item: TransactionNotification) => {
    return (
      <View key={item.id} style={styles.card}>
        {/* Top Header Row of Card: Logo | Name + Payee | Time + From SMS */}
        <View style={styles.cardHeaderRow}>
          <BankLogo
            code={item.bankCode}
            payee={item.payee}
            bankName={item.bankName}
            size={42}
          />

          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitleText} numberOfLines={1}>
              {item.bankName}
            </Text>
            <Text style={styles.cardPayeeText} numberOfLines={1}>
              {item.payee}
            </Text>
          </View>

          <View style={styles.cardMetaCol}>
            <Text style={styles.cardTimeText}>{item.time}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (item.rawBody) {
                  Alert.alert(
                    `SMS from ${item.rawAddress || item.bankName}`,
                    item.rawBody,
                    [{ text: 'Close', style: 'cancel' }]
                  );
                }
              }}
            >
              <SmsBadge />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Row of Card: Amount & Category Pill on Left | Action Buttons on Right */}
        <View style={styles.cardBottomRow}>
          <View style={styles.amountAndCategoryCol}>
            <Text style={styles.amountText}>
              ₹{formatAmount(item.amount)}
            </Text>
            <CategoryBadge category={item.category} />
          </View>

          {item.status === 'pending' && (
            <View style={styles.actionButtonsRow}>
              {/* Reject Button (triggers confirmation popup) */}
              <TouchableOpacity
                style={styles.squareRejectBtn}
                activeOpacity={0.7}
                onPress={() => promptReject(item)}
                accessibilityLabel={`Reject transaction from ${item.payee}`}
              >
                <X size={18} color="#B91C1C" strokeWidth={2.8} />
              </TouchableOpacity>

              {/* Accept Button (triggers confirmation popup) */}
              <TouchableOpacity
                style={styles.squareAcceptBtn}
                activeOpacity={0.8}
                onPress={() => promptAccept(item)}
                accessibilityLabel={`Accept transaction from ${item.payee}`}
              >
                <Check size={20} color="#FFFFFF" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'accepted' && (
            <View style={styles.statusRowAccepted}>
              <View style={styles.statusBadgeAccepted}>
                <Check size={13} color="#15803D" strokeWidth={2.5} />
                <Text style={styles.statusBadgeTextAccepted}>Accepted</Text>
              </View>
              <TouchableOpacity
                style={styles.undoButton}
                activeOpacity={0.7}
                onPress={() => handleRestoreToPending(item)}
              >
                <RotateCcw size={12} color="#64748B" />
                <Text style={styles.undoButtonText}>Undo</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.status === 'rejected' && (
            <View style={styles.statusRowRejected}>
              <View style={styles.statusBadgeRejected}>
                <X size={13} color="#B91C1C" strokeWidth={2.5} />
                <Text style={styles.statusBadgeTextRejected}>Rejected</Text>
              </View>
              <TouchableOpacity
                style={styles.undoButton}
                activeOpacity={0.7}
                onPress={() => handleRestoreToPending(item)}
              >
                <RotateCcw size={12} color="#64748B" />
                <Text style={styles.undoButtonText}>Restore</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content"/>

      {/* Screen Header matching screenshot: Squircle Back Button, Two-Line Title, Fetch New & Options Buttons */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerSquircleBtn}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#087A9F" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleLine1}>Transaction</Text>
          <Text style={styles.headerTitleLine2}>Notifications</Text>
        </View>

        <View style={styles.headerRightActions}>
          {/* Fetch New SMS Button (prominently featured in header as requested) */}
          <TouchableOpacity
            onPress={handleFetchAfterLastSync}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.headerSquircleBtn}
            accessibilityLabel="Fetch new SMS transactions"
          >
            {isScanningSms || isFetchingNew ? (
              <ActivityIndicator size="small" color="#087A9F" />
            ) : (
              <RefreshCw size={19} color="#087A9F" strokeWidth={2.4} />
            )}
          </TouchableOpacity>

          {/* Options / 3-dots Menu Button */}
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.headerSquircleBtn}
            accessibilityLabel="Options"
          >
            <MoreVerticalIcon size={20} color="#087A9F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleFetchAfterLastSync}
            colors={['#087A9F']}
            tintColor="#087A9F"
          />
        }
      >
        {/* Permission Prompt if explicitly denied on Android */}
        {hasSmsPermission === false && Platform.OS === 'android' && (
          <View style={styles.permissionCard}>
            <View style={styles.permissionLeft}>
              <ShieldAlert size={20} color="#D97706" />
              <View style={styles.permissionTextContainer}>
                <Text style={styles.permissionTitle}>SMS Access Not Enabled</Text>
                <Text style={styles.permissionDesc}>
                  Allow SMS access to read real bank transactions from your inbox.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleRequestPermission}
            >
              <Text style={styles.permissionButtonText}>Allow</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Top Review Banner Card */}
        <TouchableOpacity
          style={styles.reviewBanner}
          activeOpacity={0.85}
          onPress={handleFetchAfterLastSync}
        >
          <ReviewBannerIllustration size={54} />
          <View style={styles.bannerTextContainer}>
            <View style={styles.bannerTitleRow}>
              <Text style={styles.bannerNumber}>{pendingCount} </Text>
              <Text style={styles.bannerTitleText}>transactions need your review</Text>
            </View>
            <Text style={styles.bannerSubtext}>
              These transactions were detected from your phone's SMS inbox.
            </Text>
          </View>
          <ChevronRight size={20} color="#64748B" strokeWidth={2} />
        </TouchableOpacity>

        {/* Sync Status Card with Last Fetch Details & Fetch SMS Button */}
        <View style={styles.syncCard}>
          <View style={styles.syncCardLeft}>
            <View style={styles.syncIconContainer}>
              <Clock size={18} color="#087A9F" strokeWidth={2.4} />
            </View>
            <View style={styles.syncTextContainer}>
              <View style={styles.syncTitleRow}>
                <Text style={styles.syncTitle}>Sync Transactions</Text>
                <View style={styles.syncDot} />
              </View>
              <Text style={styles.syncSubtitle}>
                Last sync: {formatLastFetchDate(lastFetchDate)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.syncButton, (isFetchingNew || isScanningSms) && styles.syncButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleFetchAfterLastSync}
            disabled={isFetchingNew || isScanningSms}
            accessibilityLabel="Fetch new transactions from SMS"
          >
            {isFetchingNew || isScanningSms ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.syncBtnContent}>
                <Sparkles size={14} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 5 }} />
                <Text style={styles.syncButtonText}>Fetch New</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Bar: Pending (N) Capsule Pill | Accepted | Rejected */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('pending')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.tabPill,
                activeTab === 'pending' && styles.activeTabPill,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'pending' ? styles.activeTabText : styles.inactiveTabText,
                ]}
              >
                Pending ({pendingCount})
              </Text>
            </View>
            {activeTab === 'pending' && <View style={styles.activeUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('accepted')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.tabPill,
                activeTab === 'accepted' && styles.activeTabPill,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'accepted' ? styles.activeTabText : styles.inactiveTabText,
                ]}
              >
                Accepted
              </Text>
            </View>
            {activeTab === 'accepted' && <View style={styles.activeUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('rejected')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.tabPill,
                activeTab === 'rejected' && styles.activeTabPill,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'rejected' ? styles.activeTabText : styles.inactiveTabText,
                ]}
              >
                Rejected
              </Text>
            </View>
            {activeTab === 'rejected' && <View style={styles.activeUnderline} />}
          </TouchableOpacity>
        </View>

        {/* Date Wise Section Groups (14 Oct 2025, 13 Oct 2025, etc.) */}
        {groupedDateSections.map(section => (
          <View key={section.dateKey} style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {section.data.length} transaction{section.data.length > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            {section.data.map(renderCard)}
          </View>
        ))}

        {/* Empty State */}
        {displayedItems.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <CheckCircle2 size={36} color="#087A9F" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending'
                ? 'All Caught Up!'
                : activeTab === 'accepted'
                ? 'No Accepted Transactions'
                : 'No Rejected Transactions'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'pending'
                ? 'There are no pending SMS transactions to review right now.'
                : activeTab === 'accepted'
                ? 'Transactions you accept will appear here.'
                : 'Transactions you reject will appear here.'}
            </Text>
            {activeTab !== 'pending' && (
              <TouchableOpacity
                style={styles.switchTabButton}
                onPress={() => setActiveTab('pending')}
              >
                <Text style={styles.switchTabButtonText}>View Pending ({pendingCount})</Text>
              </TouchableOpacity>
            )}
            {activeTab === 'pending' && (
              <View style={styles.emptyActionButtons}>
                <TouchableOpacity
                  style={styles.switchTabButton}
                  onPress={handleFetchAfterLastSync}
                  activeOpacity={0.8}
                >
                  <View style={styles.syncBtnContent}>
                    <Sparkles size={14} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 6 }} />
                    <Text style={styles.switchTabButtonText}>Fetch New SMS</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.switchTabButton, styles.fullScanButton]}
                  onPress={() => loadSmsTransactions(true, true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.syncBtnContent}>
                    <RefreshCw size={13} color="#087A9F" strokeWidth={2.2} style={{ marginRight: 6 }} />
                    <Text style={[styles.switchTabButtonText, { color: '#087A9F' }]}>Full Rescan</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Options Dropdown Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuPopup}>
            <Text style={styles.menuTitle}>Notification Options</Text>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                handleFetchAfterLastSync();
              }}
            >
              <Sparkles size={18} color="#087A9F" />
              <Text style={styles.menuOptionText}>Fetch New SMS (After Last Sync)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                loadSmsTransactions(true, true);
              }}
            >
              <RefreshCw size={18} color="#475569" />
              <Text style={styles.menuOptionText}>Full Inbox Rescan (All SMS)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleResetSyncDate}
            >
              <RotateCcw size={18} color="#D97706" />
              <Text style={styles.menuOptionText}>Reset Sync Date</Text>
            </TouchableOpacity>

            {hasSmsPermission === false && Platform.OS === 'android' && (
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setMenuVisible(false);
                  handleRequestPermission();
                }}
              >
                <ShieldAlert size={18} color="#D97706" />
                <Text style={styles.menuOptionText}>Grant SMS Permission</Text>
              </TouchableOpacity>
            )}

            {pendingCount > 0 && (
              <>
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={handleAcceptAll}
                >
                  <Check size={18} color="#15803D" />
                  <Text style={styles.menuOptionText}>Accept All Pending ({pendingCount})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={handleRejectAll}
                >
                  <X size={18} color="#EF4444" />
                  <Text style={[styles.menuOptionText, { color: '#EF4444' }]}>
                    Reject All Pending
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleClearNotifications}
            >
              <RotateCcw size={18} color="#64748B" />
              <Text style={styles.menuOptionText}>Clear Review List</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert(
                  'SMS Auto-Detection',
                  hasSmsPermission
                    ? 'SMS permission is active. Debit alerts from HDFC, ICICI, SBI, Axis, and others are scanned and parsed directly from your device SMS.'
                    : 'SMS permission is currently off. Grant permission so ExpenseManager can read your bank SMS alerts.'
                );
              }}
            >
              <SlidersHorizontal size={18} color="#475569" />
              <Text style={styles.menuOptionText}>SMS Detection Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuOption, { borderBottomWidth: 0, marginTop: 4 }]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Confirmation Popup Modal for Reject and Accept */}
      <Modal
        visible={confirmDialog.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
      >
        <Pressable
          style={styles.dialogOverlay}
          onPress={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
        >
          <Pressable style={styles.dialogCard} onPress={e => e.stopPropagation()}>
            {/* Top Icon Badge */}
            <View
              style={[
                styles.dialogIconCircle,
                confirmDialog.type === 'accept'
                  ? styles.dialogIconCircleAccept
                  : styles.dialogIconCircleReject,
              ]}
            >
              {confirmDialog.type === 'accept' ? (
                <Check size={28} color="#087A9F" strokeWidth={3} />
              ) : (
                <X size={28} color="#EF4444" strokeWidth={3} />
              )}
            </View>

            {/* Title & Description */}
            <Text style={styles.dialogTitle}>
              {confirmDialog.type === 'accept' ? 'Accept Transaction?' : 'Reject Transaction?'}
            </Text>
            <Text style={styles.dialogDescription}>
              {confirmDialog.type === 'accept'
                ? 'This transaction will be added to your expenses and synced with your dashboard.'
                : 'Are you sure you want to reject this transaction? It will be moved to the Rejected tab.'}
            </Text>

            {/* Transaction Preview Card */}
            {confirmDialog.item && (
              <View style={styles.dialogSummaryBox}>
                <View style={styles.dialogSummaryTop}>
                  <BankLogo
                    code={confirmDialog.item.bankCode}
                    payee={confirmDialog.item.payee}
                    bankName={confirmDialog.item.bankName}
                    size={38}
                  />
                  <View style={styles.dialogSummaryInfo}>
                    <Text style={styles.dialogSummaryName} numberOfLines={1}>
                      {confirmDialog.item.bankName}
                    </Text>
                    <Text style={styles.dialogSummaryPayee} numberOfLines={1}>
                      {confirmDialog.item.payee}
                    </Text>
                  </View>
                  <Text style={styles.dialogSummaryTime}>
                    {confirmDialog.item.time}
                  </Text>
                </View>

                <View style={styles.dialogSummaryDivider} />

                <View style={styles.dialogSummaryBottom}>
                  <View>
                    <Text style={styles.dialogSummaryAmountLabel}>Amount</Text>
                    <Text style={styles.dialogSummaryAmount}>
                      ₹{formatAmount(confirmDialog.item.amount)}
                    </Text>
                  </View>
                  <CategoryBadge category={confirmDialog.item.category} />
                </View>
              </View>
            )}

            {/* Actions: Cancel vs Confirm */}
            <View style={styles.dialogActionsRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                activeOpacity={0.7}
                onPress={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.dialogCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dialogConfirmBtn,
                  confirmDialog.type === 'accept'
                    ? styles.dialogConfirmBtnAccept
                    : styles.dialogConfirmBtnReject,
                ]}
                activeOpacity={0.8}
                onPress={handleConfirmAction}
              >
                {confirmDialog.type === 'accept' ? (
                  <View style={styles.dialogBtnContent}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 6 }} />
                    <Text style={styles.dialogConfirmBtnText}>Accept</Text>
                  </View>
                ) : (
                  <View style={styles.dialogBtnContent}>
                    <X size={16} color="#FFFFFF" strokeWidth={3} style={{ marginRight: 6 }} />
                    <Text style={styles.dialogConfirmBtnText}>Reject</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8F7F8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  // Screen Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    backgroundColor: '#E8F7F8',
  },
  headerSquircleBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  headerTitleLine1: {
    fontSize: 19,
    fontWeight: '800',
    color: '#071B3A',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  headerTitleLine2: {
    fontSize: 19,
    fontWeight: '800',
    color: '#071B3A',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  // Permission Card
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 14,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  permissionDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  permissionButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 10,
  },
  permissionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#E8F7F8',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Top Review Banner (White card with subtle lavender border)
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    ...Platform.select({
      ios: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
  },
  bannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  bannerNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7C3AED',
  },
  bannerTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#071B3A',
  },
  bannerSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  // Incremental Sync Card with Last Synced Details & Fetch SMS Button
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D7EBEF',
    ...Platform.select({
      ios: {
        shadowColor: '#087A9F',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  syncCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  syncIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E0F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  syncTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#071B3A',
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  syncSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  syncButton: {
    backgroundColor: '#087A9F',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 102,
    ...Platform.select({
      ios: {
        shadowColor: '#087A9F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  // Tab Bar
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  tabItem: {
    alignItems: 'center',
  },
  tabPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabPill: {
    backgroundColor: '#DDF4F2',
  },
  tabText: {
    fontSize: 14,
    letterSpacing: -0.1,
  },
  activeTabText: {
    fontWeight: '700',
    color: '#087A9F',
  },
  inactiveTabText: {
    fontWeight: '600',
    color: '#64748B',
  },
  activeUnderline: {
    width: 44,
    height: 3,
    backgroundColor: '#087A9F',
    borderRadius: 2,
    marginTop: 3,
  },
  // Section Headers (Date + Pill)
  sectionContainer: {
    marginTop: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 6,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#071B3A',
    letterSpacing: -0.2,
  },
  sectionBadge: {
    backgroundColor: '#DEF2F3',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B6B75',
  },
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F4F8',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  // Card Header: Logo, Name/Payee, Time/SMS Badge
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitleCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#071B3A',
    letterSpacing: -0.2,
  },
  cardPayeeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#73829A',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  cardMetaCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  cardTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  smsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 4,
    marginTop: 4,
  },
  smsBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7C3AED',
  },
  // Card Bottom: Amount & Category on Left | Square Action Buttons on Right
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
  },
  amountAndCategoryCol: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  amountText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#071B3A',
    letterSpacing: -0.4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
    marginTop: 6,
  },
  categoryText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 12,
  },
  squareRejectBtn: {
    width: 46,
    height: 38,
    backgroundColor: '#FEECEC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareAcceptBtn: {
    width: 46,
    height: 38,
    backgroundColor: '#0A7D88',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0A7D88',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  // Status rows for accepted/rejected
  statusRowAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadgeAccepted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeTextAccepted: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  statusRowRejected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadgeRejected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeTextRejected: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  undoButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DDF4F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#071B3A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  switchTabButton: {
    backgroundColor: '#087A9F',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  switchTabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 12,
  },
  fullScanButton: {
    backgroundColor: '#E8F7F8',
    borderWidth: 1,
    borderColor: '#BCE8EB',
  },
  // Floating Toast
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(7, 27, 58, 0.94)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Options Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  menuPopup: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#071B3A',
    marginBottom: 16,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  menuOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  // Confirmation Popup Dialog Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 27, 58, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#071B3A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dialogIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  dialogIconCircleAccept: {
    backgroundColor: '#E0F4F6',
  },
  dialogIconCircleReject: {
    backgroundColor: '#FEECEC',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#071B3A',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  dialogDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dialogSummaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 18,
  },
  dialogSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialogSummaryInfo: {
    marginLeft: 10,
    flex: 1,
  },
  dialogSummaryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#071B3A',
  },
  dialogSummaryPayee: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  dialogSummaryTime: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#94A3B8',
  },
  dialogSummaryDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 10,
  },
  dialogSummaryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogSummaryAmountLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  dialogSummaryAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#071B3A',
    marginTop: 1,
    letterSpacing: -0.3,
  },
  dialogActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  dialogCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogCancelBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#64748B',
  },
  dialogConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dialogConfirmBtnAccept: {
    backgroundColor: '#087A9F',
  },
  dialogConfirmBtnReject: {
    backgroundColor: '#EF4444',
  },
  dialogConfirmBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dialogBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
