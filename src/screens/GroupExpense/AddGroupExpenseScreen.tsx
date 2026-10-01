import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Divide,
  FileText,
  Percent,
  Plus,
  Tag,
  Utensils,
  X,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { addExpense } from '../../store/expenseSlice';
import { addGroupExpense, getGroupById } from '../../store/groupExpenseSlice';
import {
  ExpenseParticipant,
  GroupExpense,
  GroupMember,
  SplitType,
} from '../../types/groupExpense';
import { ExpenseCategory } from '../../types/expense';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';
import { formatTransactionDate, getCategoryColor } from '../../utils/helpers';
import SplitMemberRow from '../../components/groupExpense/SplitMemberRow';
import SplitSelectorModal from '../../components/groupExpense/SplitSelectorModal';
import { calculateEqualSplit } from '../../utils/groupExpense/calculateEqualSplit';
import { calculatePercentageSplit } from '../../utils/groupExpense/calculatePercentageSplit';
import { calculateSharesSplit } from '../../utils/groupExpense/calculateSharesSplit';
import { validateSplit } from '../../utils/groupExpense/validateSplit';

const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Travel',
  'Health',
  'Other',
];

export const AddGroupExpenseScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const groupId = route.params?.groupId;
  const group = useAppSelector(getGroupById(groupId));
  const currentUser = useAppSelector((state) => state.groupExpense.currentUser);

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paidByUserId, setPaidByUserId] = useState<string>(() => {
    return currentUser?.id || (group?.members[0]?.id || '');
  });

  // Category State
  const [category, setCategory] = useState('Food & Dining');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Paid By Dropdown State
  const [showPaidByPicker, setShowPaidByPicker] = useState(false);

  // Selected participant IDs
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(() => {
    return group?.members.map((m) => m.id) || [];
  });

  // Split Type & Modal
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [showSplitTypeModal, setShowSplitTypeModal] = useState(false);

  // Split Editor Sub-Modals (Exact, Percentages, Shares)
  const [showSplitEditorModal, setShowSplitEditorModal] = useState(false);
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, string>>({});

  const totalAmount = parseFloat(amountStr) || 0;

  if (!group) {
    return (
      <View style={[styles.safeArea, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.expense, fontSize: 16 }}>Group not found</Text>
      </View>
    );
  }

  const payerMember =
    group.members.find((m) => m.id === paidByUserId) || group.members[0];

  // Toggle participant selection
  const handleToggleParticipant = (memberId: string) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) {
          Alert.alert('Required', 'At least one participant must be selected');
          return prev;
        }
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedParticipants.length === group.members.length) {
      // Keep at least payer or current user
      setSelectedParticipants([paidByUserId]);
    } else {
      setSelectedParticipants(group.members.map((m) => m.id));
    }
  };

  const handleSplitTypeSelected = (type: SplitType) => {
    setSplitType(type);
    setShowSplitTypeModal(false);

    if (type === 'equal') {
      return;
    }

    // Initialize values for editor modal
    if (type === 'exact') {
      const equalParts = calculateEqualSplit(totalAmount, selectedParticipants);
      const exactObj: Record<string, string> = {};
      equalParts.forEach((p) => {
        exactObj[p.userId] = String(p.amount);
      });
      setExactAmounts(exactObj);
      setShowSplitEditorModal(true);
    } else if (type === 'percentage') {
      const count = selectedParticipants.length;
      const basePct = count > 0 ? (100 / count).toFixed(1) : '0';
      const pctObj: Record<string, string> = {};
      selectedParticipants.forEach((uid) => {
        pctObj[uid] = basePct;
      });
      setPercentages(pctObj);
      setShowSplitEditorModal(true);
    } else if (type === 'shares') {
      const sharesObj: Record<string, string> = {};
      selectedParticipants.forEach((uid) => {
        sharesObj[uid] = '1';
      });
      setShares(sharesObj);
      setShowSplitEditorModal(true);
    }
  };

  // Compute final participants split breakdown
  const computedParticipants: ExpenseParticipant[] = useMemo(() => {
    if (totalAmount <= 0 || selectedParticipants.length === 0) return [];

    if (splitType === 'equal') {
      return calculateEqualSplit(totalAmount, selectedParticipants);
    }

    if (splitType === 'exact') {
      return selectedParticipants.map((uid) => ({
        userId: uid,
        amount: parseFloat(exactAmounts[uid] || '0') || 0,
      }));
    }

    if (splitType === 'percentage') {
      const numPercentages: Record<string, number> = {};
      selectedParticipants.forEach((uid) => {
        numPercentages[uid] = parseFloat(percentages[uid] || '0') || 0;
      });
      return calculatePercentageSplit(totalAmount, numPercentages);
    }

    if (splitType === 'shares') {
      const numShares: Record<string, number> = {};
      selectedParticipants.forEach((uid) => {
        numShares[uid] = parseFloat(shares[uid] || '0') || 0;
      });
      return calculateSharesSplit(totalAmount, numShares);
    }

    return [];
  }, [totalAmount, selectedParticipants, splitType, exactAmounts, percentages, shares]);

  // Validation
  const splitValidation = useMemo(() => {
    return validateSplit(splitType, totalAmount, computedParticipants);
  }, [splitType, totalAmount, computedParticipants]);

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert('Missing Field', 'Please enter what you spent on');
      return;
    }

    if (totalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount');
      return;
    }

    if (!splitValidation.isValid) {
      Alert.alert('Split Mismatch', splitValidation.errorMessage || 'Please check split amounts');
      return;
    }

    const newExpense: GroupExpense = {
      id: `exp_${Date.now()}`,
      groupId: group.id,
      description: description.trim(),
      amount: totalAmount,
      paidBy: paidByUserId,
      splitType,
      participants: computedParticipants,
      category,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    dispatch(addGroupExpense(newExpense));

    // When the user pays for the group expense, add the whole amount to parent expenses
    const isPayerMe = paidByUserId === currentUser.id || payerMember?.isCurrentUser;
    if (isPayerMe) {
      dispatch(
        addExpense({
          id: newExpense.id,
          title: description.trim(),
          category: (category as ExpenseCategory) || 'Other',
          amount: totalAmount,
          date: formatTransactionDate(new Date()),
          notes: `Group expense for ${group.name} (${computedParticipants.length} people)`,
          color: getCategoryColor(category),
          synced: true,
        })
      );
    }

    navigation.goBack();
  };

  const perPersonSubtitle =
    splitType === 'equal' && selectedParticipants.length > 0 && totalAmount > 0
      ? `₹${(totalAmount / selectedParticipants.length).toFixed(0)} each`
      : splitType === 'exact'
      ? 'Custom exact amounts'
      : splitType === 'percentage'
      ? 'Split by percentages'
      : 'Split by shares';

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
        <Text style={styles.headerTitle}>Add Group Expense</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Description Field */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>What did you spend on?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Dinner, Groceries, Hotel"
            placeholderTextColor={COLORS.textMuted}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={[styles.fieldLabel, { marginTop: moderateScale(16) }]}>Amount</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={amountStr}
              onChangeText={setAmountStr}
            />
          </View>
        </View>

        {/* Paid By Selector */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Paid by</Text>
          <Pressable
            onPress={() => setShowPaidByPicker(true)}
            style={styles.dropdownSelector}
          >
            <View style={styles.payerLeft}>
              <View
                style={[
                  styles.payerAvatar,
                  { backgroundColor: payerMember?.color || COLORS.primary },
                ]}
              >
                <Text style={styles.payerAvatarText}>
                  {payerMember?.initials || 'U'}
                </Text>
              </View>
              <Text style={styles.payerName}>
                {payerMember?.name} {payerMember?.isCurrentUser ? '(You)' : ''}
              </Text>
            </View>
            <ChevronDown size={moderateScale(18)} color={COLORS.textSecondary} />
          </Pressable>
        </View>

        {/* Split Between Section */}
        <View style={styles.card}>
          <View style={styles.splitBetweenHeader}>
            <Text style={styles.fieldLabel}>Split between</Text>
            <Pressable onPress={handleSelectAll} hitSlop={8}>
              <Text style={styles.selectAllText}>
                {selectedParticipants.length === group.members.length
                  ? 'Deselect All'
                  : 'Select all'}
              </Text>
            </Pressable>
          </View>

          {group.members.map((member) => (
            <SplitMemberRow
              key={member.id}
              member={member}
              mode="checkbox"
              isSelected={selectedParticipants.includes(member.id)}
              onToggleSelect={handleToggleParticipant}
            />
          ))}
        </View>

        {/* Split Type Selector */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Split type</Text>
          <Pressable
            onPress={() => setShowSplitTypeModal(true)}
            style={styles.splitTypeButton}
          >
            <View style={styles.splitTypeLeft}>
              <View style={styles.splitTypeIconCircle}>
                <Utensils size={moderateScale(18)} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.splitTypeTitle}>
                  {splitType === 'equal'
                    ? 'Split equally'
                    : splitType === 'exact'
                    ? 'Exact amounts'
                    : splitType === 'percentage'
                    ? 'Percentages'
                    : 'Shares'}
                </Text>
                <Text style={styles.splitTypeSubtitle}>{perPersonSubtitle}</Text>
              </View>
            </View>

            <ChevronRight size={moderateScale(18)} color={COLORS.textSecondary} />
          </Pressable>
        </View>

        {/* Category Selector */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Category</Text>
          <Pressable
            onPress={() => setShowCategoryPicker(true)}
            style={styles.dropdownSelector}
          >
            <View style={styles.categoryLeft}>
              <Tag size={moderateScale(18)} color={COLORS.primary} />
              <Text style={styles.categoryText}>{category}</Text>
            </View>
            <ChevronRight size={moderateScale(18)} color={COLORS.textSecondary} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom CTA Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitButton}
          activeOpacity={0.88}
        >
          <Text style={styles.submitButtonText}>Add expense</Text>
        </TouchableOpacity>
      </View>

      {/* Split Selector Bottom Sheet Modal */}
      <SplitSelectorModal
        visible={showSplitTypeModal}
        totalAmount={totalAmount}
        selectedSplitType={splitType}
        participantCount={selectedParticipants.length}
        onClose={() => setShowSplitTypeModal(false)}
        onSelectSplitType={handleSplitTypeSelected}
      />

      {/* Paid By Modal Picker */}
      <Modal
        visible={showPaidByPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaidByPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowPaidByPicker(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Who paid?</Text>
              <Pressable onPress={() => setShowPaidByPicker(false)}>
                <X size={moderateScale(20)} color={COLORS.navy} />
              </Pressable>
            </View>

            {group.members.map((member) => {
              const isSelected = member.id === paidByUserId;
              return (
                <Pressable
                  key={member.id}
                  onPress={() => {
                    setPaidByUserId(member.id);
                    setShowPaidByPicker(false);
                  }}
                  style={[
                    styles.payerOptionRow,
                    isSelected && styles.payerOptionRowSelected,
                  ]}
                >
                  <View style={styles.payerOptionLeft}>
                    <View
                      style={[
                        styles.payerAvatar,
                        { backgroundColor: member.color || COLORS.primary },
                      ]}
                    >
                      <Text style={styles.payerAvatarText}>{member.initials}</Text>
                    </View>
                    <Text style={styles.payerOptionName}>
                      {member.name} {member.isCurrentUser ? '(You)' : ''}
                    </Text>
                  </View>
                  {isSelected && (
                    <Check
                      size={moderateScale(18)}
                      color={COLORS.primary}
                      strokeWidth={2.8}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowCategoryPicker(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Category</Text>
              <Pressable onPress={() => setShowCategoryPicker(false)}>
                <X size={moderateScale(20)} color={COLORS.navy} />
              </Pressable>
            </View>

            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryPicker(false);
                }}
                style={styles.categoryOptionRow}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    category === cat && styles.categoryOptionTextSelected,
                  ]}
                >
                  {cat}
                </Text>
                {category === cat && (
                  <Check size={moderateScale(18)} color={COLORS.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Exact / Percentages / Shares Detailed Config Modal */}
      <Modal
        visible={showSplitEditorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSplitEditorModal(false)}
      >
        <View style={styles.fullModalContainer}>
          <View style={[styles.fullModalHeader, { paddingTop: topInset + 10 }]}>
            <Pressable
              onPress={() => setShowSplitEditorModal(false)}
              hitSlop={12}
              style={styles.backButton}
            >
              <ArrowLeft size={moderateScale(24)} color={COLORS.navy} />
            </Pressable>
            <Text style={styles.fullModalTitle}>
              {splitType === 'exact'
                ? 'Exact amounts'
                : splitType === 'percentage'
                ? 'Percentages'
                : 'Shares'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.fullModalBody}
            contentContainerStyle={{ paddingBottom: moderateScale(120) }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Overview Banner */}
            <View style={styles.splitBanner}>
              <View>
                <Text style={styles.splitBannerLabel}>
                  {splitType === 'exact' ? 'Total amount' : 'Total percentage'}
                </Text>
                <Text style={styles.splitBannerValue}>
                  {splitType === 'exact'
                    ? `₹${totalAmount.toLocaleString('en-IN')}`
                    : '100%'}
                </Text>
              </View>

              <View
                style={[
                  styles.validationBadge,
                  splitValidation.isValid
                    ? styles.validationBadgeValid
                    : styles.validationBadgeInvalid,
                ]}
              >
                <Text
                  style={[
                    styles.validationText,
                    splitValidation.isValid
                      ? styles.validationTextValid
                      : styles.validationTextInvalid,
                  ]}
                >
                  {splitValidation.isValid
                    ? '✓ Total matches'
                    : splitValidation.errorMessage}
                </Text>
              </View>
            </View>

            {/* Member Inputs */}
            <View style={styles.card}>
              {selectedParticipants.map((memberId) => {
                const member = group.members.find((m) => m.id === memberId);
                if (!member) return null;

                const val =
                  splitType === 'exact'
                    ? exactAmounts[memberId] || ''
                    : splitType === 'percentage'
                    ? percentages[memberId] || ''
                    : shares[memberId] || '1';

                const computedPart = computedParticipants.find(
                  (p) => p.userId === memberId
                );

                return (
                  <SplitMemberRow
                    key={member.id}
                    member={member}
                    mode={
                      splitType === 'exact'
                        ? 'exact'
                        : splitType === 'percentage'
                        ? 'percentage'
                        : 'shares'
                    }
                    value={val}
                    calculatedAmount={computedPart?.amount}
                    onChangeValue={(mId, text) => {
                      if (splitType === 'exact') {
                        setExactAmounts((prev) => ({ ...prev, [mId]: text }));
                      } else if (splitType === 'percentage') {
                        setPercentages((prev) => ({ ...prev, [mId]: text }));
                      } else {
                        setShares((prev) => ({ ...prev, [mId]: text }));
                      }
                    }}
                  />
                );
              })}
            </View>

            {/* Quick Actions Shortcuts */}
            <View style={styles.quickShortcutsRow}>
              <TouchableOpacity
                onPress={() => {
                  if (splitType === 'exact') {
                    const equalParts = calculateEqualSplit(
                      totalAmount,
                      selectedParticipants
                    );
                    const exactObj: Record<string, string> = {};
                    equalParts.forEach((p) => {
                      exactObj[p.userId] = String(p.amount);
                    });
                    setExactAmounts(exactObj);
                  } else if (splitType === 'percentage') {
                    const count = selectedParticipants.length;
                    const basePct = (100 / count).toFixed(1);
                    const pctObj: Record<string, string> = {};
                    selectedParticipants.forEach((uid) => {
                      pctObj[uid] = basePct;
                    });
                    setPercentages(pctObj);
                  }
                }}
                style={styles.shortcutBtn}
              >
                <Text style={styles.shortcutBtnText}>Split equally</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (splitType === 'exact') setExactAmounts({});
                  if (splitType === 'percentage') setPercentages({});
                  if (splitType === 'shares') setShares({});
                }}
                style={styles.shortcutBtn}
              >
                <Text style={styles.shortcutBtnText}>Clear all</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Modal Done CTA */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              onPress={() => {
                if (!splitValidation.isValid) {
                  Alert.alert(
                    'Invalid Split',
                    splitValidation.errorMessage || 'Please ensure split totals match.'
                  );
                  return;
                }
                setShowSplitEditorModal(false);
              }}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  placeholderButton: {
    width: moderateScale(40),
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingBottom: moderateScale(120),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginBottom: moderateScale(14),
    ...SHADOWS.soft,
  },
  fieldLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(8),
  },
  textInput: {
    backgroundColor: '#F2F8FC',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(46),
    fontSize: moderateScale(15),
    color: COLORS.navy,
    borderWidth: 1,
    borderColor: '#E2ECF2',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F8FC',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(52),
    borderWidth: 1,
    borderColor: '#E2ECF2',
  },
  currencySymbol: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: COLORS.navy,
    marginRight: moderateScale(8),
  },
  amountInput: {
    flex: 1,
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: COLORS.navy,
    paddingVertical: 0,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F8FC',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(48),
    borderWidth: 1,
    borderColor: '#E2ECF2',
  },
  payerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerAvatar: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  payerAvatarText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    color: COLORS.white,
  },
  payerName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },
  splitBetweenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(6),
  },
  selectAllText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  splitTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F8FC',
    borderRadius: moderateScale(14),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E2ECF2',
  },
  splitTypeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitTypeIconCircle: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    backgroundColor: '#E6F7F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  splitTypeTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },
  splitTypeSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  categoryText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
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
  submitButton: {
    backgroundColor: '#07517D', // Dark teal
    borderRadius: moderateScale(16),
    height: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(7, 27, 58, 0.45)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(36),
    ...SHADOWS.medium,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(16),
  },
  sheetTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
  },
  payerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  payerOptionRowSelected: {
    backgroundColor: '#E8F5F7',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(10),
  },
  payerOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payerOptionName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },
  categoryOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  categoryOptionText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: COLORS.navy,
  },
  categoryOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  fullModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fullModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingBottom: moderateScale(14),
  },
  fullModalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
  },
  fullModalBody: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
  },
  splitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(18),
    padding: moderateScale(16),
    marginBottom: moderateScale(14),
    ...SHADOWS.soft,
  },
  splitBannerLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  splitBannerValue: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: COLORS.navy,
    marginTop: 2,
  },
  validationBadge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(10),
  },
  validationBadgeValid: {
    backgroundColor: '#E8FAF3',
  },
  validationBadgeInvalid: {
    backgroundColor: '#FFE9EC',
  },
  validationText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  validationTextValid: {
    color: COLORS.incomeDark,
  },
  validationTextInvalid: {
    color: COLORS.expenseDark,
  },
  quickShortcutsRow: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginTop: moderateScale(4),
  },
  shortcutBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2ECF2',
  },
  shortcutBtnText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});

export default AddGroupExpenseScreen;
