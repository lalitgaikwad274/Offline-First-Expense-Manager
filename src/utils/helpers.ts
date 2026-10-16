import { APP_CONFIG } from './constants';
import { Expense, ExpenseCategory } from '../types/expense';
import { GroupExpense, ExpenseParticipant, SplitType } from '../types/groupExpense';
import { ConfirmationResult, getAuth, linkWithCredential, PhoneAuthProvider, signInWithPhoneNumber } from '@react-native-firebase/auth';
import { Briefcase, Car, Dumbbell, FileText, Fuel, Gamepad2, Gift, GraduationCap, HandCoins, Heart, Home, KeyRound, Leaf, LucideIcon, MoreHorizontal, PawPrint, PieChart, Plane, ShoppingBag, ShoppingCart, Stethoscope, Utensils, Wallet } from 'lucide-react-native';

/**
 * Format a number to currency with Indian Rupee (or configured) symbol
 */
export const formatCurrency = (value: number): string => {
  if (isNaN(value)) return `${APP_CONFIG.currencySymbol}0`;
  return `${APP_CONFIG.currencySymbol}${value.toLocaleString(APP_CONFIG.defaultLocale)}`;
};

/**
 * Format a date object or ISO string to standard display format
 */
export const formatDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate percentage change
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100);
};

/**
 * Format time with leading zeros (e.g., 09:15 AM, 10:30 AM)
 */
export const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
  return `${hoursStr}:${minutesStr} ${ampm}`;
};

/**
 * Formats a transaction date into user-friendly strings:
 * - "Today, 10:30 AM"
 * - "Yesterday, 09:15 AM"
 * - "12 Sep, 04:45 PM"
 */
export const formatTransactionDate = (dateInput?: string | number | Date | null): string => {
  if (!dateInput) {
    const now = new Date();
    return `Today, ${formatTime(now)}`;
  }

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (
      trimmed.startsWith('Today') ||
      trimmed.startsWith('Yesterday') ||
      /^\d{1,2}\s+[A-Za-z]{3},\s+\d{1,2}:\d{2}\s+(?:AM|PM)$/i.test(trimmed)
    ) {
      return trimmed;
    }
  }

  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = formatTime(date);

  if (isToday) {
    return `Today, ${timeStr}`;
  }

  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];

  return `${day} ${month}, ${timeStr}`;
};

/**
 * Returns consistent category hex color codes
 */
export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Food & Dining':
      return '#FEE9EC';
    case 'Transport':
      return '#E4F0FE';
    case 'Shopping':
      return '#FEF3E6';
    case 'Bills & Utilities':
      return '#F0EBFE';
    case 'Entertainment':
      return '#EFEAFE';
    case 'Health':
      return '#E2F7EE';
    case 'Travel':
      return '#FEF3E5';
    case 'Credit':
      return '#07566A';
    case 'Mutual Fund':
      return '#EEF1FF'
    case 'Loans':
      return '#FFF6DC';
    case 'Groceries':
      return '#E1F8F9';
    case 'Subscription':
      return '#E5F7EF';
    case 'Fitness':
      return '#E4F7EE';
    case 'Fuel':
      return '#FEECEA';
    case 'Games':
      return '#E3F0FE';
    case 'Work':
      return '#E4F0FE';
    case 'Rent':
      return '#EFEAFE';
    case 'Education':
      return '#E5F1FE';
    case 'Personal':
      return '#FEECF2';
    default:
      return '#F0EAFE';
  }
};

export const getCategoryIcon = (category: string): {
  icon: LucideIcon;
  bg: string;
  color: string;
} => {
  const cat = category.toLowerCase();
  if (cat.includes('shopping') || cat.includes('shop')) {
    return { icon: ShoppingBag, bg: '#FFF3E6', color: '#FF7205' };
  }
  if (cat.includes('food') || cat.includes('dining') || cat.includes('dinner') || cat.includes('lunch')) {
    return { icon: Utensils, bg: '#FFE9EC', color: '#FF2B3F' };
  }
  if (cat.includes('rent')) {
    return { icon: KeyRound, bg: '#EFEAFE', color: '#9459FF' };
  }
  if (cat.includes('home') || cat.includes('house')) {
    return { icon: Home, bg: '#E5F8EF', color: '#14A257' };
  }
  if (cat.includes('transport') || cat.includes('taxi') || cat.includes('cab')) {
    return { icon: Car, bg: '#E4F0FE', color: '#3688FF' };
  }
  if (cat.includes('entertainment') || cat.includes('movie')) {
    return { icon: Gift, bg: '#EFEAFE', color: '#9558FF' };
  }
  if (cat.includes('travel') || cat.includes('flight') || cat.includes('trip')) {
    return { icon: Plane, bg: '#FFF3E5', color: '#FF7006' };
  }
  if (cat.includes('health') || cat.includes('medical') || cat.includes('doctor')) {
    return { icon: Stethoscope, bg: '#E2F7EE', color: '#077D41' };
  }
  if (cat.includes('personal')) {
    return { icon: Heart, bg: '#FFECF2', color: '#FF4276' };
  }
  if (cat.includes('education') || cat.includes('school') || cat.includes('course')) {
    return { icon: GraduationCap, bg: '#E5F1FE', color: '#3686FC' };
  }
  if (cat.includes('bill') || cat.includes('utilit')) {
    return { icon: FileText, bg: '#F0EBFE', color: '#9E67FF' };
  }
  if (cat.includes('grocer')) {
    return { icon: ShoppingCart, bg: '#E1F8F9', color: '#0FC6C7' };
  }
  if (cat.includes('fitness') || cat.includes('gym')) {
    return { icon: Dumbbell, bg: '#E4F7EE', color: '#119450' };
  }
  if (cat.includes('fuel') || cat.includes('petrol') || cat.includes('gas')) {
    return { icon: Fuel, bg: '#FFECEA', color: '#FF1E09' };
  }
  if (cat.includes('game')) {
    return { icon: Gamepad2, bg: '#E3F0FE', color: '#408CFF' };
  }
  if (cat.includes('work') || cat.includes('office') || cat.includes('business')) {
    return { icon: Briefcase, bg: '#E4F0FE', color: '#3786FF' };
  }
  if (cat.includes('subscription') || cat.includes('netflix') || cat.includes('recurring')) {
    return { icon: Leaf, bg: '#E5F7EF', color: '#09894E' };
  }

  if (cat.includes('mutual') || cat.includes('fund') || cat.includes('sip') || cat.includes('invest')) {
    return { icon: PieChart, bg: '#E8ECFF', color: '#4F5BD5' };
  }
  if (cat.includes('loan') || cat.includes('emi') || cat.includes('debt')) {
    return { icon: HandCoins, bg: '#FFF1CC', color: '#F5A623' };
  }
  if (cat.includes('credit')) {
    return { icon: Wallet, bg: '#e9fff1ff', color: '#1dc563ff' };
  }
  // Others / default
  return { icon: MoreHorizontal, bg: '#F0EAFE', color: '#9659F8' };
}
/**
 * Formats any raw transaction (e.g. from backend API) into the standard Expense format:
 * {
 *   id: "1",
 *   category: "Food & Dining",
 *   amount: 320,
 *   date: "Today, 10:30 AM",
 *   color: "#F21F38",
 *   synced: true
 * }
 */
export const formatTransaction = (item: any, fallbackId?: string): Expense => {
  const category = (item.category || item?.description || item.type || 'Other') as ExpenseCategory;
  const color = item.color || getCategoryColor(category);
  const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0;
  const date = formatTransactionDate(item.transaction_date || item.created_at);
  const synced = item.synced !== undefined ? Boolean(item.synced) : true;
  const id = String(item.id || item.transactionId || fallbackId || Date.now().toString());

  return {
    id,
    category,
    amount,
    date,
    color,
    synced,
    ...(item.title ? { title: item.title } : {}),
    ...(item.notes ? { notes: item.notes } : {}),
    ...(item.bankName ? { bankName: item.bankName } : {}),
    ...(item.bankId ? { bankId: item.bankId } : {}),
  };
};

/**
 * Formats a raw group expense (e.g. from backend API response) into the standard GroupExpense format:
 */
export const formatGroupExpense = (raw: any): GroupExpense => {
  if (!raw) {
    return {} as GroupExpense;
  }

  const rawSplits = Array.isArray(raw?.splits) ? raw.splits : [];
  const rawParticipants = Array.isArray(raw?.participants) ? raw.participants : [];

  let participants: ExpenseParticipant[] = [];
  if (rawSplits.length > 0) {
    participants = rawSplits.map((s: any) => ({
      userId: String(s.member_id ?? s.userId ?? ''),
      amount: typeof s.amount === 'number' ? s.amount : parseFloat(s.amount) || 0,
      percentage: s.percentage !== undefined ? parseFloat(s.percentage) || 0 : undefined,
      shares: s.shares !== undefined ? parseFloat(s.shares) || 0 : undefined,
    }));
  } else if (rawParticipants.length > 0) {
    participants = rawParticipants.map((p: any) => ({
      userId: String(p.userId ?? p.member_id ?? ''),
      amount: typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0,
      percentage: p.percentage !== undefined ? parseFloat(p.percentage) || 0 : undefined,
      shares: p.shares !== undefined ? parseFloat(p.shares) || 0 : undefined,
    }));
  }

  const rawAmount = typeof raw.amount === 'number' ? raw.amount : parseFloat(raw.amount) || 0;

  return {
    id: String(raw.id || `exp_${Date.now()}`),
    groupId: String(raw.group_id ?? raw.groupId ?? ''),
    group_id: raw.group_id,
    description: raw.description || '',
    amount: rawAmount,
    paidBy: String(raw.paid_by ?? raw.paidBy ?? ''),
    paid_by: raw.paid_by,
    payer_name: raw.payer_name,
    splitType: (raw.split_type ?? raw.splitType ?? 'equal') as SplitType,
    split_type: raw.split_type,
    participants,
    splits: raw.splits,
    category: raw.category_name || raw.category || 'Other',
    category_id: raw.category_id,
    category_name: raw.category_name,
    date: raw.expense_date || raw.date || raw.created_at || new Date().toISOString(),
    expense_date: raw.expense_date,
    notes: raw.notes ?? undefined,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    created_at: raw.created_at,
    updatedAt: raw.updated_at || raw.updatedAt,
    updated_at: raw.updated_at,
  };
};

export const sendOtp = async (phoneNumber: string) => {

}


export const verifyPhoneOTP = async (
  confirmation: ConfirmationResult,
  code: string
) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Please log in first');
  }

  try {
    const credential = PhoneAuthProvider.credential(
      confirmation.verificationId,
      code
    );

    const result = await linkWithCredential(
      currentUser,
      credential
    );

    return {
      uid: result.user.uid,
      phoneNumber: result.user.phoneNumber,
      isVerified: true,
    };
  } catch (error) {
    console.error('Phone verification failed:', error);
    throw error;
  }
};