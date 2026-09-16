import React from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Tag,
  Trash2,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteExpense } from '../../store/expenseSlice';
import { COLORS, moderateScale, SHADOWS } from '../../utils/constants';

const ExpenseDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const expenseId = route.params?.expenseId;

  const expense = useAppSelector(state =>
    state.expense.expenses.find(e => e.id === expenseId)
  );

  if (!expense) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Expense not found</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backHomeBtn}
          >
            <Text style={styles.backHomeBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${expense.title || expense.category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteExpense(expense.id));
            navigation.goBack();
          },
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
          <Text style={styles.headerTitle}>Expense Details</Text>
        </View>

        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteHeaderButton}
          accessibilityRole="button"
          accessibilityLabel="Delete Expense"
        >
          <Trash2 size={moderateScale(20)} color={COLORS.red} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.amountValue}>
            ₹{expense.amount.toLocaleString('en-IN')}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{expense.category}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <FileText size={moderateScale(18)} color={COLORS.petrol} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Title / Payee</Text>
              <Text style={styles.detailValue}>{expense.title || expense.category}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Tag size={moderateScale(18)} color={COLORS.petrol} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{expense.category}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Calendar size={moderateScale(18)} color={COLORS.petrol} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{expense.date}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              {expense.synced ? (
                <CheckCircle2 size={moderateScale(18)} color="#40C057" />
              ) : (
                <Clock size={moderateScale(18)} color="#FFA94D" />
              )}
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Sync Status</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: expense.synced ? '#2B8A3E' : '#D9480F' },
                ]}
              >
                {expense.synced ? 'Synced to Cloud' : 'Pending Local Sync'}
              </Text>
            </View>
          </View>

          {expense.notes && (
            <>
              <View style={styles.rowDivider} />
              <View style={styles.detailRow}>
                <View style={styles.iconBox}>
                  <FileText size={moderateScale(18)} color={COLORS.petrol} />
                </View>
                <View style={styles.detailTextCol}>
                  <Text style={styles.detailLabel}>Notes</Text>
                  <Text style={styles.detailValue}>{expense.notes}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Delete Action Button */}
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
          activeOpacity={0.8}
        >
          <Trash2 size={moderateScale(18)} color={COLORS.red} strokeWidth={2.2} />
          <Text style={styles.deleteButtonText}>Delete This Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExpenseDetailsScreen;

const styles = StyleSheet.create({
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
  deleteHeaderButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(28),
  },
  amountCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(22),
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
    marginBottom: moderateScale(6),
  },
  amountValue: {
    fontSize: moderateScale(34),
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: moderateScale(10),
  },
  categoryBadge: {
    backgroundColor: 'rgba(219, 245, 248, 0.9)',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(14),
  },
  categoryBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.petrol,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(18),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    marginBottom: moderateScale(18),
    borderWidth: 1,
    borderColor: 'rgba(219, 237, 240, 0.8)',
    ...SHADOWS.soft,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(12),
    gap: moderateScale(12),
  },
  iconBox: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(219, 245, 248, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(219, 237, 240, 0.6)',
    marginLeft: moderateScale(48),
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    gap: moderateScale(8),
    ...SHADOWS.soft,
  },
  deleteButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.red,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(20),
  },
  notFoundText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(12),
  },
  backHomeBtn: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    backgroundColor: COLORS.petrol,
    borderRadius: moderateScale(12),
  },
  backHomeBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});