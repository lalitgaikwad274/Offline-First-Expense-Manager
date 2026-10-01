import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Circle } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { addExpense } from '../../store/expenseSlice';
import { addSettlement, getGroupById } from '../../store/groupExpenseSlice';
import { GroupMember, GroupSettlement, PaymentMethod } from '../../types/groupExpense';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';
import { formatTransactionDate, getCategoryColor } from '../../utils/helpers';

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'UPI', 'Bank transfer', 'Other'];

export const SettleGroupScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const { groupId, fromUserId, toUserId, suggestedAmount, targetMember, direction } =
    route.params || {};

  const group = useAppSelector(getGroupById(groupId));
  const currentUser = useAppSelector((state) => state.groupExpense.currentUser);

  const [amountStr, setAmountStr] = useState<string>(
    suggestedAmount ? String(suggestedAmount) : ''
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');

  if (!group || !targetMember) {
    return (
      <View style={[styles.safeArea, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.expense, fontSize: 16 }}>Settlement information missing</Text>
      </View>
    );
  }

  const isTheyOweMe = direction === 'theyOweYou';
  const amount = parseFloat(amountStr) || 0;

  const handleMarkAsPaid = () => {
    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
      return;
    }

    const settlement: GroupSettlement = {
      id: `settle_${Date.now()}`,
      groupId: group.id,
      fromUserId: fromUserId || targetMember.id,
      toUserId: toUserId || currentUser.id,
      amount,
      method: selectedMethod,
      date: new Date().toISOString(),
      notes: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    dispatch(addSettlement(settlement));

    const isReceivingSettlement =
      direction === 'theyOweYou' || settlement.toUserId === currentUser.id;

    if (isReceivingSettlement) {
      // Group member settled your debt -> acts as credit in parent expenses
      const settlementNotes = note.trim()
        ? `Group settlement from ${targetMember.name} (${group.name}): ${note.trim()}`
        : `Group settlement from ${targetMember.name} (${group.name})`;

      dispatch(
        addExpense({
          id: settlement.id,
          title: 'Group Settlement',
          category: 'Credit',
          amount,
          date: formatTransactionDate(new Date()),
          notes: settlementNotes,
          color: getCategoryColor('Credit'),
          synced: true,
        })
      );
    } else {
      // You settled group member's debt -> gets added to parent expenses
      const settlementNotes = note.trim()
        ? `Settled group debt with ${targetMember.name} (${group.name}): ${note.trim()}`
        : `Settled group debt with ${targetMember.name} (${group.name})`;

      dispatch(
        addExpense({
          id: settlement.id,
          title: 'Group Settlement',
          category: 'Other',
          amount,
          date: formatTransactionDate(new Date()),
          notes: settlementNotes,
          color: getCategoryColor('Other'),
          synced: true,
        })
      );
    }

    Alert.alert('Settled!', `Payment of ₹${amount.toLocaleString('en-IN')} marked as paid.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.safeArea, { paddingTop: topInset }]}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backButton}
        >
          <ArrowLeft size={moderateScale(24)} color={COLORS.navy} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.headerTitle}>Settle up</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recipient & Amount Card */}
        <View style={styles.profileCard}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: targetMember.color || '#845EF7' },
            ]}
          >
            <Text style={styles.avatarText}>{targetMember.initials || 'U'}</Text>
          </View>

          <Text style={styles.memberName}>{targetMember.name}</Text>
          <Text style={styles.relationText}>
            {isTheyOweMe ? 'owes you' : 'you owe'}
          </Text>

          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amountStr}
              onChangeText={setAmountStr}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment method</Text>

          <View style={styles.radioGrid}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethod === method;
              return (
                <Pressable
                  key={method}
                  onPress={() => setSelectedMethod(method)}
                  style={[
                    styles.radioItem,
                    isSelected && styles.radioItemSelected,
                  ]}
                >
                  <View style={styles.radioCircle}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text
                    style={[
                      styles.radioLabel,
                      isSelected && styles.radioLabelSelected,
                    ]}
                  >
                    {method}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Optional Note Field */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Add a note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder={`e.g. Paid for ${group.name} dinner`}
            placeholderTextColor={COLORS.textMuted}
            value={note}
            onChangeText={setNote}
          />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          onPress={handleMarkAsPaid}
          style={styles.markPaidButton}
          activeOpacity={0.88}
        >
          <Text style={styles.markPaidButtonText}>Mark as paid</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingVertical: moderateScale(12),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  headerTitle: {
    fontSize: moderateScale(19),
    fontWeight: '800',
    color: COLORS.navy,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(120),
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    alignItems: 'center',
    marginBottom: moderateScale(16),
    ...SHADOWS.soft,
  },
  avatar: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(12),
  },
  avatarText: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: COLORS.white,
  },
  memberName: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
  },
  relationText: {
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: moderateScale(12),
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: moderateScale(32),
    fontWeight: '800',
    color: COLORS.navy,
    marginRight: 4,
  },
  amountInput: {
    fontSize: moderateScale(32),
    fontWeight: '800',
    color: COLORS.navy,
    paddingVertical: 0,
    minWidth: moderateScale(80),
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginBottom: moderateScale(16),
    ...SHADOWS.soft,
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(12),
  },
  radioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(10),
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    borderWidth: 1.5,
    borderColor: '#E8EEF3',
  },
  radioItemSelected: {
    backgroundColor: '#EBF8FA',
    borderColor: COLORS.primary,
  },
  radioCircle: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(8),
  },
  radioDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: COLORS.navy,
  },
  radioLabelSelected: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  noteInput: {
    backgroundColor: '#F2F8FC',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(46),
    fontSize: moderateScale(14),
    color: COLORS.navy,
    borderWidth: 1,
    borderColor: '#E2ECF2',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: '#EBF1F5',
    ...SHADOWS.medium,
  },
  markPaidButton: {
    backgroundColor: '#07517D', // Dark teal
    borderRadius: moderateScale(16),
    height: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  markPaidButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default SettleGroupScreen;
