import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

export interface RawSms {
  id: string;
  address: string;
  body: string;
  date: number; // timestamp in ms
}

export interface ParsedSmsTransaction {
  id: string;
  bankName: string;
  bankCode: 'hdfc' | 'icici' | 'sbi' | 'axis' | 'other';
  amount: number;
  payee: string;
  category: 'Food & Dining' | 'Shopping' | 'Utilities' | 'Transport' | 'Entertainment' | 'Other';
  time: string;
  dateGroup: 'Today' | 'Yesterday' | 'Earlier';
  status: 'pending' | 'accepted' | 'rejected';
  source: 'SMS';
  rawBody?: string;
  rawAddress?: string;
  timestamp: number;
}

/**
 * Checks if SMS reading permission is granted
 */
export async function checkSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS
    );
    return granted;
  } catch (err) {
    console.warn('Error checking SMS permission:', err);
    return false;
  }
}

/**
 * Requests SMS reading permission on Android
 */
export async function requestSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SMS Permission for Expense Detection',
        message:
          'ExpenseManager reads bank SMS alerts locally on your device to automatically detect expenses. Your SMS data never leaves your phone.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Allow',
      }
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Error requesting SMS permission:', err);
    return false;
  }
}

/**
 * Identify Bank from sender ID or body text
 */
function identifyBank(address: string, body: string): { name: string; code: 'hdfc' | 'icici' | 'sbi' | 'axis' | 'other' } {
  const upperAddr = (address || '').toUpperCase();
  const upperBody = (body || '').toUpperCase();

  if (upperAddr.includes('HDFC') || upperBody.includes('HDFC')) {
    return { name: 'HDFC Bank', code: 'hdfc' };
  }
  if (upperAddr.includes('ICICI') || upperBody.includes('ICICI')) {
    return { name: 'ICICI Bank', code: 'icici' };
  }
  if (upperAddr.includes('SBI') || upperBody.includes('SBI') || upperBody.includes('STATE BANK')) {
    return { name: 'SBI Bank', code: 'sbi' };
  }
  if (upperAddr.includes('AXIS') || upperBody.includes('AXIS')) {
    return { name: 'Axis Bank', code: 'axis' };
  }
  if (upperAddr.includes('KOTAK') || upperBody.includes('KOTAK')) {
    return { name: 'Kotak Bank', code: 'other' };
  }
  if (upperAddr.includes('PNB') || upperBody.includes('PUNJAB NATIONAL')) {
    return { name: 'PNB Bank', code: 'other' };
  }

  return { name: 'Bank Alert', code: 'other' };
}

/**
 * Determine category based on payee or SMS content
 */
function inferCategory(payee: string, body: string): 'Food & Dining' | 'Shopping' | 'Utilities' | 'Transport' | 'Entertainment' | 'Other' {
  const combined = `${payee} ${body}`.toLowerCase();

  // Food & Dining
  if (
    combined.includes('swiggy') ||
    combined.includes('zomato') ||
    combined.includes('starbucks') ||
    combined.includes('mcdonald') ||
    combined.includes('kfc') ||
    combined.includes('burger') ||
    combined.includes('domino') ||
    combined.includes('cafe') ||
    combined.includes('restaurant') ||
    combined.includes('food') ||
    combined.includes('dine')
  ) {
    return 'Food & Dining';
  }

  // Shopping
  if (
    combined.includes('amazon') ||
    combined.includes('flipkart') ||
    combined.includes('myntra') ||
    combined.includes('meesho') ||
    combined.includes('ajio') ||
    combined.includes('zara') ||
    combined.includes('nykaa') ||
    combined.includes('store') ||
    combined.includes('mall') ||
    combined.includes('retail') ||
    combined.includes('mart')
  ) {
    return 'Shopping';
  }

  // Utilities
  if (
    combined.includes('electricity') ||
    combined.includes('bescom') ||
    combined.includes('bill') ||
    combined.includes('power') ||
    combined.includes('water') ||
    combined.includes('gas') ||
    combined.includes('recharge') ||
    combined.includes('airtel') ||
    combined.includes('jio') ||
    combined.includes('broadband') ||
    combined.includes('tatasky')
  ) {
    return 'Utilities';
  }

  // Transport
  if (
    combined.includes('uber') ||
    combined.includes('ola') ||
    combined.includes('rapido') ||
    combined.includes('metro') ||
    combined.includes('irctc') ||
    combined.includes('fuel') ||
    combined.includes('petrol') ||
    combined.includes('indian oil') ||
    combined.includes('bpcl') ||
    combined.includes('hpcl') ||
    combined.includes('shell')
  ) {
    return 'Transport';
  }

  // Entertainment
  if (
    combined.includes('netflix') ||
    combined.includes('spotify') ||
    combined.includes('prime') ||
    combined.includes('hotstar') ||
    combined.includes('pvr') ||
    combined.includes('inox') ||
    combined.includes('bookmyshow') ||
    combined.includes('cinema')
  ) {
    return 'Entertainment';
  }

  return 'Other';
}

/**
 * Format timestamp into Date Group (Today, Yesterday, Earlier)
 */
function getDateGroup(timestamp: number): 'Today' | 'Yesterday' | 'Earlier' {
  const now = new Date();
  const date = new Date(timestamp);

  const isToday =
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    yesterday.getDate() === date.getDate() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getFullYear() === date.getFullYear();

  if (isYesterday) return 'Yesterday';

  return 'Earlier';
}

/**
 * Format timestamp into time string (e.g. 1:24 PM)
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minStr} ${ampm}`;
}

/**
 * Clean and extract Payee / Merchant name from SMS body
 */
function extractPayee(body: string, bankName: string): string {
  // Regex for "to <Merchant>" or "at <Merchant>" or "Info: <Merchant>" or "for <Merchant>"
  const toMatch = body.match(/(?:to|at|Info:|for|towards|paid to)\s+([A-Za-z0-9\s._&-]+?)(?:\s+on|\s+ref|\s+UPI|\s+A\/C|\s+using|\.|\,|$)/i);

  if (toMatch && toMatch[1]) {
    const rawPayee = toMatch[1].trim();
    // Filter out common non-merchant words
    const cleanPayee = rawPayee.replace(/^(VPA\s+|retail\s+|a\/c\s+)/i, '').trim();
    if (cleanPayee.length > 2 && cleanPayee.length < 35) {
      return cleanPayee;
    }
  }

  // Fallback to merchant keyword detection
  const lower = body.toLowerCase();
  if (lower.includes('swiggy')) return 'Swiggy';
  if (lower.includes('zomato')) return 'Zomato';
  if (lower.includes('amazon')) return 'Amazon';
  if (lower.includes('flipkart')) return 'Flipkart';
  if (lower.includes('electricity')) return 'Electricity Bill';
  if (lower.includes('uber')) return 'Uber';
  if (lower.includes('ola')) return 'Ola';
  if (lower.includes('starbucks')) return 'Starbucks';

  return `${bankName} Payment`;
}

/**
 * Parse an SMS string or RawSms into a ParsedSmsTransaction
 */
export function parseSmsTransaction(sms: RawSms): ParsedSmsTransaction | null {
  const body = sms.body || '';

  // Filter: Must be a debit / expense alert, ignore OTPs, credits, balances, promotional
  const isDebit =
    /(?:debited|spent|sent|paid|deducted|withdrawn|purchase of|txn of)/i.test(body) &&
    !/(?:credited to your account|received Rs|refund of)/i.test(body);

  if (!isDebit) {
    return null;
  }

  // Extract Amount: e.g. Rs. 1,250.00, INR 850, Rs 2400
  const amountMatch = body.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!amountMatch || !amountMatch[1]) {
    return null;
  }

  const rawAmountStr = amountMatch[1].replace(/,/g, '');
  const amount = parseFloat(rawAmountStr);
  if (isNaN(amount) || amount <= 0) {
    return null;
  }

  const { name: bankName, code: bankCode } = identifyBank(sms.address, body);
  const payee = extractPayee(body, bankName);
  const category = inferCategory(payee, body);
  const timestamp = sms.date || Date.now();

  return {
    id: `sms-tx-${sms.id}`,
    bankName,
    bankCode,
    amount,
    payee,
    category,
    time: formatTime(timestamp),
    dateGroup: getDateGroup(timestamp),
    status: 'pending',
    source: 'SMS',
    rawBody: body,
    rawAddress: sms.address,
    timestamp,
  };
}

let memoryLastFetchDate = 0;

/**
 * Gets the timestamp of the last SMS fetch from persistent storage
 */
export async function getLastSmsFetchDate(): Promise<number> {
  const nativeModule = NativeModules.SmsReaderModule;
  if (Platform.OS === 'android' && nativeModule && typeof nativeModule.getLastFetchDate === 'function') {
    try {
      const ts = await nativeModule.getLastFetchDate();
      if (typeof ts === 'number' && ts > 0) {
        memoryLastFetchDate = ts;
        return ts;
      }
    } catch (err) {
      console.warn('Failed to get last SMS fetch date from native storage:', err);
    }
  }
  return memoryLastFetchDate;
}

/**
 * Persists the timestamp of the last SMS fetch to storage
 */
export async function setLastSmsFetchDate(timestamp: number): Promise<boolean> {
  memoryLastFetchDate = timestamp;
  const nativeModule = NativeModules.SmsReaderModule;
  if (Platform.OS === 'android' && nativeModule && typeof nativeModule.setLastFetchDate === 'function') {
    try {
      const res = await nativeModule.setLastFetchDate(timestamp);
      return !!res;
    } catch (err) {
      console.warn('Failed to persist last SMS fetch date:', err);
    }
  }
  return true;
}

export interface FetchSmsOptions {
  sinceTimestamp?: number;
  maxCount?: number;
  updateLastFetchDate?: boolean;
}

/**
 * Fetches SMS from device inbox via native module or fallback simulator
 * Supports incremental fetching using sinceTimestamp
 */
export async function getSmsTransactions(options?: FetchSmsOptions): Promise<{
  transactions: ParsedSmsTransaction[];
  isRealDevice: boolean;
  permissionGranted: boolean;
  fetchDate: number;
}> {
  // Check if native module is available
  const nativeModule = NativeModules.SmsReaderModule;
  const sinceTimestamp = options?.sinceTimestamp && options.sinceTimestamp > 0 ? options.sinceTimestamp : 0;
  const maxCount = options?.maxCount || 200;
  const shouldUpdateDate = options?.updateLastFetchDate !== false;

  if (Platform.OS === 'android' && nativeModule && nativeModule.getSms) {
    try {
      const hasPerm = await checkSmsPermission();
      if (!hasPerm) {
        const requested = await requestSmsPermission();
        if (!requested) {
          const lastTs = await getLastSmsFetchDate();
          return { transactions: [], isRealDevice: true, permissionGranted: false, fetchDate: lastTs };
        }
      }

      // Read real SMS from Android inbox with minDate filter
      const queryOptions: { maxCount: number; minDate?: number } = { maxCount };
      if (sinceTimestamp > 0) {
        queryOptions.minDate = sinceTimestamp;
      }

      const rawSmsList: RawSms[] = await nativeModule.getSms(queryOptions);

      // Filter by timestamp in JS as well for precision
      const filteredSmsList = (rawSmsList || []).filter(sms => {
        if (!sinceTimestamp || sinceTimestamp <= 0) return true;
        return (sms.date || 0) > sinceTimestamp;
      });

      const parsedTransactions = filteredSmsList
        .map(parseSmsTransaction)
        .filter(Boolean) as ParsedSmsTransaction[];

      const now = Date.now();
      if (shouldUpdateDate) {
        await setLastSmsFetchDate(now);
      }

      const effectiveDate = shouldUpdateDate ? now : await getLastSmsFetchDate();

      return {
        transactions: parsedTransactions,
        isRealDevice: true,
        permissionGranted: true,
        fetchDate: effectiveDate,
      };
    } catch (err) {
      console.warn('Native SMS reading error:', err);
      const lastTs = await getLastSmsFetchDate();
      return {
        transactions: [],
        isRealDevice: true,
        permissionGranted: false,
        fetchDate: lastTs,
      };
    }
  }

  // If not on Android or native module not yet loaded
  const currentSavedDate = await getLastSmsFetchDate();
  return {
    transactions: [],
    isRealDevice: false,
    permissionGranted: false,
    fetchDate: currentSavedDate,
  };
}
