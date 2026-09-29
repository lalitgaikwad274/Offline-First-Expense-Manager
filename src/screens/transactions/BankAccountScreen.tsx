import React, { useState, useEffect } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Check,
  CreditCard,
  Landmark,
  Plus,
  Trash2,
  Wallet,
  X,
} from 'lucide-react-native';
import { COLORS } from '../../utils/colors';
import { moderateScale } from '../../utils/responsive';
import { SHADOWS } from '../../utils/constants';
import { ENDPOINTS } from '../../utils/ApiConstants';
import { serverCall } from '../../services/api';

export interface BankAccountItem {
  id: string;
  bankName: string;
  accountName: string;
  accountType: string;
  lastFour: string;
  balance: number;
  initial: string;
}

export interface BankDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccountAdded?: (account: BankAccountItem) => void;
}

const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
];

const ACCOUNT_TYPES = [
  { key: 'savings', label: 'Savings', icon: Wallet },
  { key: 'checking', label: 'Current', icon: Landmark },
  { key: 'credit_card', label: 'Credit Card', icon: CreditCard },
];

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * BankDetailsModal
 * Standalone modal popup to add new bank account details
 */
export const BankDetailsModal: React.FC<BankDetailsModalProps> = ({
  visible,
  onClose,
  onAccountAdded,
}) => {
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setBankName('');
    setAccountName('');
    setAccountType('savings');
    setAccountNumber('');
    setBalance('');
    setErrorMessage('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectBank = (selected: string) => {
    setBankName(selected);
    if (!accountName) {
      setAccountName(`${selected} Account`);
    }
    setErrorMessage('');
  };

  const handleSave = async () => {
    if (!bankName.trim()) {
      setErrorMessage('Please enter or select a bank name');
      return;
    }

    if (!accountName.trim()) {
      setErrorMessage('Please enter an account nickname');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const numericBalance = parseFloat(balance.replace(/[^0-9.]/g, '')) || 0;
    const cleanLastFour = accountNumber.trim().slice(-4) || 'XXXX';
    const payload = {
      bank_name: bankName.trim(),
      account_name: accountName.trim(),
      account_type: accountType,
      current_balance: numericBalance,
    };

    try {
      let createdAccount: any = null;
      try {
        createdAccount = await serverCall(
          ENDPOINTS.ADD_BANK_ACCOUNT,
          'POST',
          {},
          payload
        );
      } catch (apiError: any) {
        console.warn('API call encountered an issue, continuing locally:', apiError?.message);
      }
      console.log("##### createdAccount", createdAccount)
      const newAccount: BankAccountItem = {
        id: createdAccount?.id?.toString() || Date.now().toString(),
        bankName: payload.bank_name,
        accountName: payload.account_name,
        accountType:
          accountType === 'savings'
            ? 'Savings'
            : accountType === 'checking'
            ? 'Current'
            : 'Credit Card',
        lastFour: cleanLastFour,
        balance: numericBalance,
        initial: payload.bank_name.charAt(0).toUpperCase(),
      };

      Alert.alert('Success', 'Bank account connected successfully!');
      onAccountAdded?.(newAccount);
      handleClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to add bank account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.modalBackdrop} onPress={handleClose} />

        <View style={styles.sheetContainer}>
          {/* Top Drag Indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalIconBox}>
                <Landmark
                  size={moderateScale(20)}
                  color={COLORS.primary}
                  strokeWidth={2.2}
                />
              </View>
              <View style={styles.modalHeaderTextContainer}>
                <Text style={styles.modalTitle}>Add Bank Details</Text>
                <Text style={styles.modalSubtitle}>
                  Link your account to track transactions & balance
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.modalCloseButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <X size={moderateScale(18)} color={COLORS.navy} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Bank Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bank Name *</Text>
              <View style={styles.inputWrapper}>
                <Landmark
                  size={moderateScale(18)}
                  color={COLORS.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. HDFC Bank, ICICI Bank"
                  placeholderTextColor={COLORS.textMuted}
                  value={bankName}
                  onChangeText={text => {
                    setBankName(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="words"
                />
              </View>

              {/* Popular Banks Chips */}
              <Text style={styles.chipsLabel}>Popular Banks</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {POPULAR_BANKS.map(item => {
                  const isSelected = bankName.toLowerCase() === item.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.bankChip,
                        isSelected && styles.bankChipActive,
                      ]}
                      onPress={() => handleSelectBank(item)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.bankChipText,
                          isSelected && styles.bankChipTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Account Nickname / Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Nickname *</Text>
              <View style={styles.inputWrapper}>
                <Wallet
                  size={moderateScale(18)}
                  color={COLORS.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Salary Account, Emergency Fund"
                  placeholderTextColor={COLORS.textMuted}
                  value={accountName}
                  onChangeText={text => {
                    setAccountName(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                />
              </View>
            </View>

            {/* Account Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Type</Text>
              <View style={styles.typeRow}>
                {ACCOUNT_TYPES.map(type => {
                  const isSelected = accountType === type.key;
                  const Icon = type.icon;
                  return (
                    <TouchableOpacity
                      key={type.key}
                      style={[
                        styles.typeCard,
                        isSelected && styles.typeCardActive,
                      ]}
                      onPress={() => setAccountType(type.key)}
                      activeOpacity={0.75}
                    >
                      <Icon
                        size={moderateScale(18)}
                        color={isSelected ? COLORS.primary : COLORS.gray}
                        strokeWidth={isSelected ? 2.3 : 1.8}
                      />
                      <Text
                        style={[
                          styles.typeCardText,
                          isSelected && styles.typeCardTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Account Number / Last 4 Digits */}
            {/* <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Account Number / Last 4 Digits (Optional)
              </Text>
              <View style={styles.inputWrapper}>
                <CreditCard
                  size={moderateScale(18)}
                  color={COLORS.gray}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 4821 or full account number"
                  placeholderTextColor={COLORS.textMuted}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="numeric"
                  maxLength={18}
                />
              </View>
              <Text style={styles.helperText}>
                Only last 4 digits will be displayed for privacy.
              </Text>
            </View> */}

            {/* Initial / Current Balance */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Opening / Current Balance</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.currencyPrefixBadge}>
                  <Text style={styles.currencyPrefixText}>₹</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={balance}
                  onChangeText={setBalance}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Check
                    size={moderateScale(18)}
                    color={COLORS.white}
                    strokeWidth={2.5}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.saveButtonText}>Save Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const DEFAULT_ACCOUNTS: BankAccountItem[] = [
  {
    id: '1',
    bankName: 'HDFC Bank',
    accountName: 'Salary Account',
    accountType: 'Savings',
    lastFour: '4821',
    balance: 28450,
    initial: 'H',
  },
  {
    id: '2',
    bankName: 'ICICI Bank',
    accountName: 'Personal Savings',
    accountType: 'Savings',
    lastFour: '9034',
    balance: 12180,
    initial: 'I',
  },
  {
    id: '3',
    bankName: 'State Bank of India',
    accountName: 'Emergency Fund',
    accountType: 'Savings',
    lastFour: '2210',
    balance: 1950,
    initial: 'S',
  },
];

/**
 * BankDetails (Default Export)
 * Acts both as a standalone Screen and can be invoked directly as a Modal if passed visible/onClose props.
 */
const BankAccountScreen: React.FC<Partial<BankDetailsModalProps>> = props => {
  // If invoked with modal props directly, render the modal
  if (props.visible !== undefined) {
    return (
      <BankDetailsModal
        visible={props.visible}
        onClose={props.onClose || (() => {})}
        onAccountAdded={props.onAccountAdded}
      />
    );
  }

  const navigation = useNavigation<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<BankAccountItem[]>(DEFAULT_ACCOUNTS);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setIsFetching(true);
      const res = await serverCall(ENDPOINTS.GET_BANK_ACCOUNT, 'GET');
      console.log("#### GET_BANK_ACCOUNT", res)
      const accountList = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      if (accountList.length > 0) {
        const formatted: BankAccountItem[] = accountList.map((item: any) => ({
          id: item.id?.toString() || Math.random().toString(),
          bankName: item.bank_name || 'Bank Account',
          accountName: item.account_name || 'Account',
          accountType:
            item.account_type === 'savings'
              ? 'Savings'
              : item.account_type === 'checking'
              ? 'Current'
              : 'Credit Card',
          lastFour: (item.account_number || '').slice(-4) || '••••',
          balance: parseFloat(item.current_balance) || 0,
          initial: (item.bank_name || 'B').charAt(0).toUpperCase(),
        }));
        setAccounts(formatted);
      }
    } catch (e: any) {
      console.warn('Could not fetch remote accounts, using initial list:', e?.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleAccountAdded = (newAccount: BankAccountItem) => {
    setAccounts(prev => [newAccount, ...prev]);
  };

  const handleDeleteAccount = async(id: string) => {
      const res = await serverCall(ENDPOINTS.DELETE_BANK_ACCOUNT + `/${id}`, 'DELETE', {
          id: id
      });
      console.log("#### DELETE_BANK_ACCOUNT", res)
    Alert.alert(
      'Remove Bank Account',
      'Are you sure you want to remove this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setAccounts(prev => prev.filter(acc => acc.id !== id));
          },
        },
      ]
    );
  };

  const totalBalance = accounts.reduce((sum, item) => sum + item.balance, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content"  />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back to Profile"
          activeOpacity={0.7}
        >
          <ArrowLeft
            size={moderateScale(20)}
            color={COLORS.navy}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Bank Details</Text>
          <Text style={styles.headerSubtitle}>
            {accounts.length} connected accounts
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add bank account"
        >
          <Plus size={moderateScale(20)} color={COLORS.white} strokeWidth={2.6} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Total Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.circleLarge} />
          <View style={styles.circleSmall} />

          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>COMBINED BALANCE</Text>
            <Text style={styles.totalBalance}>{formatCurrency(totalBalance)}</Text>
            <Text style={styles.balanceDescription}>
              Across all linked bank accounts
            </Text>
          </View>

          <View style={styles.bankBadge}>
            <Landmark size={24} color={COLORS.white} strokeWidth={2.2} />
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Linked Accounts</Text>
          {isFetching && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
        </View>

        {/* Bank Accounts List */}
        <FlatList
          data={accounts}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.accountCard}>
              <View style={styles.bankIcon}>
                <Text style={styles.bankInitial}>{item.initial}</Text>
              </View>

              <View style={styles.accountInfo}>
                <Text style={styles.bankName} numberOfLines={1}>
                  {item.bankName}
                </Text>
                <View style={styles.accountMeta}>
                  <Text style={styles.accountType}>{item.accountType}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.accountNumber}>•••• {item.lastFour}</Text>
                </View>
              </View>

              <View style={styles.accountRight}>
                <Text style={styles.balance}>
                  {formatCurrency(item.balance)}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAccount(item.id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.bankName}`}
                >
                  <Trash2
                    size={moderateScale(16)}
                    color={COLORS.textMuted}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Landmark size={40} color={COLORS.textMuted} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No Bank Accounts Connected</Text>
              <Text style={styles.emptySubtitle}>
                Add your bank accounts to track income, expenses and balances.
              </Text>
            </View>
          }
        />

        {/* Bottom CTA to open Modal */}
        <TouchableOpacity
          style={styles.bottomAddButton}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.85}
        >
          <Plus size={moderateScale(20)} color={COLORS.white} strokeWidth={2.4} />
          <Text style={styles.bottomAddButtonText}>Add Bank Details</Text>
        </TouchableOpacity>
      </View>

      {/* The Modal Popup */}
      <BankDetailsModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccountAdded={handleAccountAdded}
      />
    </SafeAreaView>
  );
};

export default BankAccountScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  container: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
  },

  /* Header */
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
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: moderateScale(12),
  },

  headerTitle: {
    fontSize: moderateScale(19),
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    color: COLORS.gray,
    marginTop: 1,
  },

  headerAddButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },

  /* Combined Balance Card */
  balanceCard: {
    height: 145,
    borderRadius: moderateScale(22),
    backgroundColor: COLORS.navy,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: moderateScale(12),
    ...SHADOWS.medium,
  },

  balanceContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(22),
    zIndex: 2,
  },

  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: moderateScale(10.5),
    fontWeight: '700',
    letterSpacing: 1.1,
  },

  totalBalance: {
    color: COLORS.white,
    fontSize: moderateScale(30),
    fontWeight: '800',
    marginTop: moderateScale(6),
    letterSpacing: -0.5,
  },

  balanceDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: moderateScale(11),
    marginTop: moderateScale(10),
  },

  circleLarge: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -60,
    top: -30,
    backgroundColor: 'rgba(8, 122, 166, 0.35)',
  },

  circleSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    right: -15,
    top: -15,
    backgroundColor: 'rgba(99, 221, 229, 0.2)',
  },

  bankBadge: {
    position: 'absolute',
    right: moderateScale(20),
    top: moderateScale(20),
    zIndex: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: moderateScale(8),
    borderRadius: moderateScale(12),
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(8),
    marginBottom: moderateScale(8),
  },

  sectionHeading: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },

  listContent: {
    paddingBottom: moderateScale(16),
  },

  /* Account Card */
  accountCard: {
    minHeight: 70,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(18),
    marginBottom: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.soft,
  },

  bankIcon: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(8, 122, 166, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bankInitial: {
    fontSize: moderateScale(17),
    fontWeight: '700',
    color: COLORS.primary,
  },

  accountInfo: {
    flex: 1,
    marginLeft: moderateScale(12),
  },

  bankName: {
    fontSize: moderateScale(13.5),
    fontWeight: '700',
    color: COLORS.navy,
  },

  accountMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(3),
  },

  accountType: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
    fontWeight: '500',
  },

  dot: {
    marginHorizontal: moderateScale(5),
    color: COLORS.gray,
    fontSize: moderateScale(10),
  },

  accountNumber: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
  },

  accountRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  balance: {
    fontSize: moderateScale(13.5),
    fontWeight: '800',
    color: COLORS.navy,
  },

  deleteButton: {
    padding: moderateScale(4),
    marginTop: moderateScale(6),
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(40),
  },

  emptyTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: moderateScale(12),
  },

  emptySubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: moderateScale(4),
    paddingHorizontal: moderateScale(24),
  },

  bottomAddButton: {
    height: moderateScale(50),
    borderRadius: moderateScale(16),
    backgroundColor: COLORS.primary,
    marginBottom: Platform.OS === 'ios' ? moderateScale(16) : moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },

  bottomAddButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(14.5),
    fontWeight: '700',
    marginLeft: moderateScale(8),
  },

  /* -------------------------------------------------------------
     Modal Popup Styles
  ------------------------------------------------------------- */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(7, 27, 58, 0.52)',
  },

  modalBackdrop: {
  },

  sheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? moderateScale(24) : moderateScale(16),
    ...SHADOWS.medium,
  },

  handleContainer: {
    alignItems: 'center',
    paddingVertical: moderateScale(10),
  },

  handleBar: {
    width: moderateScale(42),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    backgroundColor: '#D1DDE5',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  modalIconBox: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(8, 122, 166, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },

  modalHeaderTextContainer: {
    flex: 1,
  },

  modalTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.2,
  },

  modalSubtitle: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
    marginTop: moderateScale(2),
  },

  modalCloseButton: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: moderateScale(8),
  },

  formScrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(20),
  },

  errorBanner: {
    backgroundColor: 'rgba(242, 31, 56, 0.1)',
    borderRadius: moderateScale(12),
    padding: moderateScale(10),
    marginBottom: moderateScale(14),
    borderWidth: 1,
    borderColor: 'rgba(242, 31, 56, 0.25)',
  },

  errorText: {
    color: COLORS.expense,
    fontSize: moderateScale(12),
    fontWeight: '600',
    textAlign: 'center',
  },

  inputGroup: {
    marginBottom: moderateScale(16),
  },

  inputLabel: {
    fontSize: moderateScale(12.5),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(6),
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: COLORS.border,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(12),
    height: moderateScale(48),
  },

  inputIcon: {
    marginRight: moderateScale(10),
  },

  textInput: {
    flex: 1,
    fontSize: moderateScale(13.5),
    color: COLORS.navy,
    fontWeight: '500',
    paddingVertical: 0,
  },

  chipsLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: moderateScale(8),
    marginBottom: moderateScale(6),
  },

  chipsScroll: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },

  bankChip: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(16),
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  bankChipActive: {
    backgroundColor: 'rgba(8, 122, 166, 0.12)',
    borderColor: COLORS.primary,
  },

  bankChipText: {
    fontSize: moderateScale(11.5),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  bankChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  typeRow: {
    flexDirection: 'row',
    gap: moderateScale(8),
  },

  typeCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(14),
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: COLORS.border,
    gap: moderateScale(4),
  },

  typeCardActive: {
    backgroundColor: 'rgba(8, 122, 166, 0.08)',
    borderColor: COLORS.primary,
  },

  typeCardText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.gray,
  },

  typeCardTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  helperText: {
    fontSize: moderateScale(10.5),
    color: COLORS.textMuted,
    marginTop: moderateScale(4),
    marginLeft: moderateScale(4),
  },

  currencyPrefixBadge: {
    backgroundColor: 'rgba(8, 122, 166, 0.12)',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(8),
    marginRight: moderateScale(10),
  },

  currencyPrefixText: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: COLORS.primary,
  },

  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: moderateScale(12),
  },

  cancelButton: {
    flex: 1,
    height: moderateScale(46),
    borderRadius: moderateScale(14),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontSize: moderateScale(13.5),
    fontWeight: '700',
    color: COLORS.gray,
  },

  saveButton: {
    flex: 2,
    height: moderateScale(46),
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    fontSize: moderateScale(13.5),
    fontWeight: '700',
    color: COLORS.white,
  },
});