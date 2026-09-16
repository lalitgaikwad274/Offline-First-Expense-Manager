import { APP_CONFIG } from './constants';

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
