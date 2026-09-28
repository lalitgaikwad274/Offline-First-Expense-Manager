import { APP_CONFIG } from './constants';
import { Expense, ExpenseCategory } from '../types/expense';

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
      return '#F21F38';
    case 'Transport':
      return '#1478E8';
    case 'Shopping':
      return '#F59E0B';
    case 'Bills & Utilities':
      return '#51CF66';
    case 'Entertainment':
      return '#845EF7';
    case 'Health':
      return '#F06595';
    case 'Travel':
      return '#20C997';
    case 'Credit':
      return '#07566A';
    case 'mutual funds':
    case 'Loans':
      return '#FF6B6B';
    default:
      return '#868E96';
  }
};

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
  const category = (item.category || item.type || 'Other') as ExpenseCategory;
  const color = item.color || getCategoryColor(category);
  const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0;
  const date = formatTransactionDate(item.date || item.createdAt || item.timestamp);
  const synced = item.synced !== undefined ? Boolean(item.synced) : true;
  const id = String(item.id || item._id || item.transactionId || fallbackId || Date.now().toString());

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

