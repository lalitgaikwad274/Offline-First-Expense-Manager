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
  Calendar,
  Check,
  CreditCard,
  DollarSign,
  FileText,
  Tag,
} from 'lucide-react-native';
import { useAppDispatch } from '../../store';
import { addExpense } from '../../store/expenseSlice';
import { COLORS, moderateScale, SHADOWS } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import { ExpenseCategory } from '../../types/expense';

const CATEGORIES: { label: ExpenseCategory; color: string }[] = [
  { label: 'Food & Dining', color: '#FF6B6B' },
  { label: 'Transport', color: '#339AF0' },
  { label: 'Shopping', color: '#FCC419' },
  { label: 'Bills & Utilities', color: '#51CF66' },
  { label: 'Entertainment', color: '#845EF7' },
  { label: 'Health', color: '#F06595' },
  { label: 'Travel', color: '#20C997' },
  { label: 'Other', color: '#868E96' },
];

const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('Food & Dining');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const parsedAmount = parseFloat(amount.trim());
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      title: title.trim() || selectedCategory,
      category: selectedCategory,
      amount: parsedAmount,
      date: 'Today, Just now',
      notes: notes.trim() || undefined,
      color: CATEGORIES.find(c => c.label === selectedCategory)?.color || COLORS.expense,
      synced: false, // Default offline first!
    };

    dispatch(addExpense(newExpense));

    Alert.alert(
      'Expense Recorded',
      `₹${parsedAmount.toLocaleString('en-IN')} added under ${selectedCategory}.`,
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

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
          <Text style={styles.headerTitle}>Add Expense</Text>
          <Text style={styles.headerSubtitle}>Record a new transaction</Text>
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
          {/* Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>AMOUNT</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="rgba(17, 34, 47, 0.25)"
                keyboardType="numeric"
                autoFocus
              />
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Title / Description */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FileText size={moderateScale(15)} color={COLORS.petrol} />
                <Text style={styles.fieldLabel}>Title / Payee</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Grocery store, Uber ride, Coffee"
                placeholderTextColor={COLORS.gray}
              />
            </View>

            {/* Category Selector */}
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
            accessibilityLabel="Save Expense"
          >
            <Check size={moderateScale(20)} color={COLORS.white} strokeWidth={2.5} />
            <Text style={styles.saveButtonText}>Save Expense</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyPrefix: {
    fontSize: moderateScale(32),
    fontWeight: '800',
    color: COLORS.petrol,
    marginRight: moderateScale(4),
  },
  amountInput: {
    fontSize: moderateScale(36),
    fontWeight: '800',
    color: COLORS.navy,
    minWidth: moderateScale(100),
    textAlign: 'center',
    padding: 0,
  },
  formSection: {
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