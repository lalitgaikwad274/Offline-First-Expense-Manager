import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Check,
  CreditCard,
  FileText,
  Tag,
} from 'lucide-react-native';
import { useAppDispatch } from '../../store';
import { addExpense, setIncome } from '../../store/expenseSlice';
import { COLORS, moderateScale, SHADOWS } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import { ExpenseCategory } from '../../types/expense';
import BankDropdown, { Bank } from '../../components/BankDropdown';

const CATEGORIES: { label: ExpenseCategory; color: string }[] = [
  { label: 'Food & Dining', color: '#FF6B6B' },
  { label: 'Transport', color: '#339AF0' },
  { label: 'Shopping', color: '#FCC419' },
  { label: 'Bills & Utilities', color: '#51CF66' },
  { label: 'Entertainment', color: '#845EF7' },
  { label: 'Health', color: '#F06595' },
  { label: 'Travel', color: '#20C997' },
  { label: 'mutual funds', color: '#FF6B6B' },
  { label: 'Loans', color: '#FF6B6B' },
  { label: 'Other', color: '#868E96' },

];

let banklist = [
  {
    "id": "airtel-payments-bank",
    "name": "Airtel Payments Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/airtel-payments-bank/icon.svg"
  },
  {
    "id": "au-small-finance-bank",
    "name": "AU Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/au-small-finance-bank/icon.svg"
  },
  {
    "id": "axis-bank",
    "name": "Axis Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/axis-bank/icon.svg"
  },
  {
    "id": "bandhan-bank",
    "name": "Bandhan Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/bandhan-bank/icon.svg"
  },
  {
    "id": "bank-of-baroda",
    "name": "Bank of Baroda",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/bank-of-baroda/icon.svg"
  },
  {
    "id": "bank-of-india",
    "name": "Bank of India",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/bank-of-india/icon.svg"
  },
  {
    "id": "bank-of-maharashtra",
    "name": "Bank of Maharashtra",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/bank-of-maharashtra/icon.svg"
  },
  {
    "id": "canara-bank",
    "name": "Canara Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/canara-bank/icon.svg"
  },
  {
    "id": "capital-small-finance-bank",
    "name": "Capital Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/capital-small-finance-bank/icon.svg"
  },
  {
    "id": "central-bank-of-india",
    "name": "Central Bank of India",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/central-bank-of-india/icon.svg"
  },
  {
    "id": "citibank-india",
    "name": "Citibank India",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/citibank-india/icon.svg"
  },
  {
    "id": "city-union-bank",
    "name": "City Union Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/city-union-bank/icon.svg"
  },
  {
    "id": "csb-bank",
    "name": "CSB Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/csb-bank/icon.svg"
  },
  {
    "id": "dbs-bank-india",
    "name": "DBS Bank India",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/dbs-bank-india/icon.svg"
  },
  {
    "id": "dcb-bank",
    "name": "DCB Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/dcb-bank/icon.svg"
  },
  {
    "id": "equitas-small-finance-bank",
    "name": "Equitas Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/equitas-small-finance-bank/icon.svg"
  },
  {
    "id": "esaf-small-finance-bank",
    "name": "ESAF Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/esaf-small-finance-bank/icon.svg"
  },
  {
    "id": "federal-bank",
    "name": "Federal Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/federal-bank/icon.svg"
  },
  {
    "id": "fincare-small-finance-bank",
    "name": "Fincare Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/fincare-small-finance-bank/icon.svg"
  },
  {
    "id": "fino-payments-bank",
    "name": "Fino Payments Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/fino-payments-bank/icon.svg"
  },
  {
    "id": "hdfc-bank",
    "name": "HDFC Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/hdfc-bank/icon.svg"
  },
  {
    "id": "hsbc-india",
    "name": "HSBC India",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/hsbc-india/icon.svg"
  },
  {
    "id": "icici-bank",
    "name": "ICICI Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/icici-bank/icon.svg"
  },
  {
    "id": "idbi-bank",
    "name": "IDBI Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/idbi-bank/icon.svg"
  },
  {
    "id": "idfc-first-bank",
    "name": "IDFC FIRST Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/idfc-first-bank/icon.svg"
  },
  {
    "id": "india-post-payments-bank",
    "name": "India Post Payments Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/india-post-payments-bank/icon.svg"
  },
  {
    "id": "indian-bank",
    "name": "Indian Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/indian-bank/icon.svg"
  },
  {
    "id": "indian-overseas-bank",
    "name": "Indian Overseas Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/indian-overseas-bank/icon.svg"
  },
  {
    "id": "indusind-bank",
    "name": "IndusInd Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/indusind-bank/icon.svg"
  },
  {
    "id": "jammu-kashmir-bank",
    "name": "Jammu & Kashmir Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/jammu-kashmir-bank/icon.svg"
  },
  {
    "id": "jana-small-finance-bank",
    "name": "Jana Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/jana-small-finance-bank/icon.svg"
  },
  {
    "id": "jio-payments-bank",
    "name": "Jio Payments Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/jio-payments-bank/icon.svg"
  },
  {
    "id": "karnataka-bank",
    "name": "Karnataka Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/karnataka-bank/icon.svg"
  },
  {
    "id": "kotak-mahindra-bank",
    "name": "Kotak Mahindra Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/kotak-mahindra-bank/icon.svg"
  },
  {
    "id": "nsdl-payments-bank",
    "name": "NSDL Payments Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/nsdl-payments-bank/icon.svg"
  },
  {
    "id": "paytm-payments-bank",
    "name": "Paytm Payments Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/paytm-payments-bank/icon.svg"
  },
  {
    "id": "punjab-national-bank",
    "name": "Punjab National Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/punjab-national-bank/icon.svg"
  },
  {
    "id": "punjab-sind-bank",
    "name": "Punjab & Sind Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/punjab-sind-bank/icon.svg"
  },
  {
    "id": "rbl-bank",
    "name": "RBL Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/rbl-bank/icon.svg"
  },
  {
    "id": "south-indian-bank",
    "name": "South Indian Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/south-indian-bank/icon.svg"
  },
  {
    "id": "standard-chartered-india",
    "name": "Standard Chartered India",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/standard-chartered-india/icon.svg"
  },
  {
    "id": "state-bank-of-india",
    "name": "State Bank of India",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/state-bank-of-india/icon.svg"
  },
  {
    "id": "suryodaya-small-finance-bank",
    "name": "Suryodaya Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/suryodaya-small-finance-bank/icon.svg"
  },
  {
    "id": "tamilnad-mercantile-bank",
    "name": "Tamilnad Mercantile Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/tamilnad-mercantile-bank/icon.svg"
  },
  {
    "id": "uco-bank",
    "name": "UCO Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/uco-bank/icon.svg"
  },
  {
    "id": "ujjivan-small-finance-bank",
    "name": "Ujjivan Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/ujjivan-small-finance-bank/icon.svg"
  },
  {
    "id": "union-bank-of-india",
    "name": "Union Bank of India",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/union-bank-of-india/icon.svg"
  },
  {
    "id": "unity-small-finance-bank",
    "name": "Unity Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/unity-small-finance-bank/icon.svg"
  },
  {
    "id": "utkarsh-small-finance-bank",
    "name": "Utkarsh Small Finance Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/utkarsh-small-finance-bank/icon.svg"
  },
  {
    "id": "yes-bank",
    "name": "Yes Bank",
    "icon": "https://cdn.jsdelivr.net/gh/Finmarks/Finmarks@main/entities/yes-bank/icon.svg"
  }
]
const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const [transactionType, setTransactionType] = useState<'debit' | 'credit'>('debit');
  const isCredit = transactionType === 'credit';

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('Food & Dining');
  const [notes, setNotes] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  // Only reset the amount when the user actually changes Debit/Credit.
  // The TextInput remains a normal controlled React Native input.
  const handleTransactionTypeChange = (type: 'debit' | 'credit') => {
    if (type === transactionType) {
      return;
    }

    setAmount('');
    setTransactionType(type);
  };

  const handleAmountChange = (value: string) => {
    // Do not modify the text while the user is typing.
    // This is important for iOS TextInput cursor/selection handling.
    setAmount(value);
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount.trim());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      title: title.trim() || (isCredit ? 'Credit' : selectedCategory),
      category: isCredit ? 'Credit' : selectedCategory,
      type: transactionType,
      bankId: selectedBank?.id,
      bankName: selectedBank?.name,
      amount: parsedAmount,
      date: 'Today, Just now',
      notes: notes.trim() || undefined,
      color: isCredit
        ? COLORS.petrol
        : CATEGORIES.find(c => c.label === selectedCategory)?.color || COLORS.expense,
      synced: false, // Default offline first!
    };

    isCredit && dispatch(setIncome(parsedAmount))
    dispatch(addExpense(newExpense));

    Alert.alert(
      isCredit ? 'Credit Recorded' : 'Expense Recorded',
      `₹${parsedAmount.toLocaleString('en-IN')} ${isCredit ? 'credited' : 'added'}${selectedBank ? ` to ${selectedBank.name}` : ''}.`,
      [
        {
          text: 'View Transactions',
          onPress: () => navigation.navigate(SCREEN_NAMES.TRANSACTIONS),
        },
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={moderateScale(20)} color={COLORS.navy} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {isCredit ? 'Add Credit' : 'Add Expense'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isCredit ? 'Record a new income' : 'Record a new transaction'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Debit / Credit Tabs */}
          <View style={styles.transactionTabs}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleTransactionTypeChange('debit')}
              style={[
                styles.transactionTab,
                transactionType === 'debit' && styles.transactionTabActive,
              ]}
            >
              <Text
                style={[
                  styles.transactionTabText,
                  transactionType === 'debit' && styles.transactionTabTextActive,
                ]}
              >
                Debit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleTransactionTypeChange('credit')}
              style={[
                styles.transactionTab,
                transactionType === 'credit' && styles.creditTabActive,
              ]}
            >
              <Text
                style={[
                  styles.transactionTabText,
                  transactionType === 'credit' && styles.transactionTabTextActive,
                ]}
              >
                Credit
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>AMOUNT</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <View style={styles.amountField}>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="rgba(17, 34, 47, 0.25)"
                  keyboardType="decimal-pad"
                  editable
                  autoFocus={false}
                  autoCorrect={false}
                  autoCapitalize="none"
                  textAlign="center"
                  caretHidden={false}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
          </View>


          {/* Bank */}
          <View style={styles.bankSection}>
            <View style={styles.labelRow}>
              <CreditCard size={moderateScale(15)} color={COLORS.petrol} />
              <Text style={styles.fieldLabel}>
                {isCredit ? 'Credit Account' : 'Debit Account'}
              </Text>
            </View>

            <BankDropdown
              banks={banklist}
              value={selectedBank}
              placeholder="Select your bank"
              onChange={setSelectedBank}
            />
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Title / Description */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FileText size={moderateScale(15)} color={COLORS.petrol} />
                <Text style={styles.fieldLabel}>{isCredit ? 'Source / Description' : 'Title / Payee'}</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder={isCredit ? 'e.g. Salary, Freelance, Cashback' : 'e.g. Grocery store, Uber ride, Coffee'}
                placeholderTextColor={COLORS.gray}
              />
            </View>

            {!isCredit && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Tag size={moderateScale(15)} color={COLORS.petrol} />
                  <Text style={styles.fieldLabel}>Category</Text>
                </View>
                <View style={styles.chipGrid}>
                  {CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat.label;
                    return (
                      <TouchableOpacity
                        key={cat.label}
                        onPress={() => setSelectedCategory(cat.label)}
                        style={[
                          styles.chip,
                          isSelected && {
                            backgroundColor: cat.color,
                            borderColor: cat.color,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.chipDot,
                            { backgroundColor: isSelected ? COLORS.white : cat.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Notes */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <CreditCard size={moderateScale(15)} color={COLORS.petrol} />
                <Text style={styles.fieldLabel}>Optional Note</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add extra details..."
                placeholderTextColor={COLORS.gray}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveButton}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={isCredit ? 'Save Credit' : 'Save Expense'}
          >
            <Check size={moderateScale(20)} color={COLORS.white} strokeWidth={2.5} />
            <Text style={styles.saveButtonText}>{isCredit ? 'Save Credit' : 'Save Expense'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddExpenseScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(32),
  },
  transactionTabs: {
    height: moderateScale(52),
    backgroundColor: '#EAF2F7',
    borderRadius: moderateScale(26),
    padding: moderateScale(4),
    flexDirection: 'row',
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.9)',
  },
  transactionTab: {
    flex: 1,
    borderRadius: moderateScale(23),
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionTabActive: {
    backgroundColor: COLORS.expense,
    ...SHADOWS.soft,
  },
  creditTabActive: {
    backgroundColor: COLORS.petrol,
    ...SHADOWS.soft,
  },
  transactionTabText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
  },
  transactionTabTextActive: {
    color: COLORS.white,
  },
  bankSection: {
    position: 'relative',
    zIndex: 20,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(18),
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    ...SHADOWS.soft,
  },
  amountCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    alignItems: 'center',
    marginBottom: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    ...SHADOWS.soft,
  },
  amountLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 0.8,
    marginBottom: moderateScale(8),
  },
  amountInputRow: {
    width: '100%',
    minHeight: moderateScale(68),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyPrefix: {
    fontSize: moderateScale(32),
    fontWeight: '800',
    color: COLORS.petrol,
    marginRight: moderateScale(6),
    includeFontPadding: false,
  },
  amountField: {
    width: moderateScale(180),
    height: moderateScale(54),
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountInput: {
    width: '100%',
    height: moderateScale(54),
    fontSize: moderateScale(36),
    fontWeight: '800',
    color: COLORS.navy,
    padding: 0,
    margin: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  formSection: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(18),
    marginBottom: moderateScale(18),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    ...SHADOWS.soft,
  },
  inputGroup: {
    marginBottom: moderateScale(16),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
    marginBottom: moderateScale(8),
  },
  fieldLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.navy,
  },
  textInput: {
    backgroundColor: 'rgba(247, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.9)',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    fontSize: moderateScale(14),
    color: COLORS.navy,
  },
  notesInput: {
    height: moderateScale(70),
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(7),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(247, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.9)',
    gap: moderateScale(6),
  },
  chipDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  chipText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.navy,
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.petrol,
    paddingVertical: moderateScale(15),
    borderRadius: moderateScale(16),
    gap: moderateScale(8),
    ...SHADOWS.medium,
  },
  saveButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
});