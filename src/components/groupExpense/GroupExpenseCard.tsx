import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Car,
  Coffee,
  CreditCard,
  Film,
  Home,
  Package,
  Plane,
  Receipt,
  Shield,
  ShoppingBag,
  Utensils,
} from 'lucide-react-native';
import { GroupExpense, GroupMember } from '../../types/groupExpense';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';

export interface GroupExpenseCardProps {
  expense: GroupExpense;
  members: GroupMember[];
  currentUserId: string;
  onPress: (expense: GroupExpense) => void;
}

const getCategoryIcon = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('dining') || cat.includes('dinner') || cat.includes('lunch')) {
    return { icon: Utensils, bg: '#FFEBEF', color: '#FF3D55' };
  }
  if (cat.includes('transport') || cat.includes('cab') || cat.includes('taxi') || cat.includes('auto')) {
    return { icon: Car, bg: '#EBF4FF', color: '#339AF0' };
  }
  if (cat.includes('travel') || cat.includes('flight') || cat.includes('hotel') || cat.includes('stay')) {
    return { icon: Plane, bg: '#FFF4E6', color: '#FD7E14' };
  }
  if (cat.includes('shopping') || cat.includes('mall') || cat.includes('grocer')) {
    return { icon: ShoppingBag, bg: '#FFF9DB', color: '#FAB005' };
  }
  if (cat.includes('entertainment') || cat.includes('movie')) {
    return { icon: Film, bg: '#F3F0FF', color: '#7950F2' };
  }
  if (cat.includes('bills') || cat.includes('utilities') || cat.includes('rent')) {
    return { icon: Home, bg: '#E6FCF5', color: '#20C997' };
  }
  if (cat.includes('snack') || cat.includes('coffee') || cat.includes('tea')) {
    return { icon: Coffee, bg: '#FFF4E6', color: '#E8590C' };
  }
  return { icon: Receipt, bg: '#F1F3F5', color: '#868E96' };
};

const formatExpenseTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Today';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Today';
  }
};

export const GroupExpenseCard = memo(({
  expense,
  members,
  currentUserId,
  onPress,
}: GroupExpenseCardProps) => {
  const memberMap = new Map<string, GroupMember>();
  members.forEach((m) => memberMap.set(String(m.id), m));

  const payerId = String(expense.paidBy || expense.paid_by || '');
  const payer = memberMap.get(payerId);
  const isPayerMe = payerId === String(currentUserId) || payer?.isCurrentUser;
  const payerName = isPayerMe ? 'You' : payer?.name?.split(' ')[0] || expense.payer_name || 'Member';

  const participants = expense.participants || [];
  const participantCount = participants.length;
  const myParticipant = participants.find((p) => String(p.userId) === String(currentUserId) || memberMap.get(String(p.userId))?.isCurrentUser);

  const { icon: CategoryIcon, bg: iconBg, color: iconColor } = getCategoryIcon(expense.category || expense.category_name || expense.description);

  const expenseAmount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;

  // Compute what current user gets back or owes for this specific expense
  let badgeType: 'getBack' | 'owe' | 'settled' | 'none' = 'none';
  let badgeAmount = 0;

  if (isPayerMe) {
    // I paid total, other participants owe me: (total - myShare)
    const myShare = myParticipant ? (typeof myParticipant.amount === 'number' ? myParticipant.amount : parseFloat(myParticipant.amount) || 0) : 0;
    const othersOwe = Number((expenseAmount - myShare).toFixed(2));
    if (othersOwe > 0.01) {
      badgeType = 'getBack';
      badgeAmount = othersOwe;
    } else {
      badgeType = 'settled';
    }
  } else if (myParticipant) {
    // Someone else paid, I am participant: I owe myShare
    const myShare = typeof myParticipant.amount === 'number' ? myParticipant.amount : parseFloat(myParticipant.amount) || 0;
    if (myShare > 0.01) {
      badgeType = 'owe';
      badgeAmount = myShare;
    }
  }

  const timeString = formatExpenseTime(expense.date || expense.expense_date || expense.createdAt);

  return (
    <Pressable
      onPress={() => onPress(expense)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${expense.description}, ₹${expenseAmount}`}
    >
      <View style={styles.leftGroup}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <CategoryIcon size={moderateScale(22)} color={iconColor} strokeWidth={2.2} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.description}
          </Text>

          <Text style={styles.subtitle} numberOfLines={1}>
            {payerName} paid · {participantCount} {participantCount === 1 ? 'person' : 'people'}
          </Text>

          <Text style={styles.timeText}>
            Today, {timeString}
          </Text>
        </View>
      </View>

      <View style={styles.rightGroup}>
        <Text style={styles.totalAmount}>
          ₹{expenseAmount.toLocaleString('en-IN')}
        </Text>

        {badgeType === 'getBack' && (
          <View style={styles.getBackPill}>
            <Text style={styles.getBackText}>
              You get back ₹{badgeAmount.toLocaleString('en-IN')}
            </Text>
          </View>
        )}

        {badgeType === 'owe' && (
          <View style={styles.owePill}>
            <Text style={styles.oweText}>
              You owe ₹{badgeAmount.toLocaleString('en-IN')}
            </Text>
          </View>
        )}

        {badgeType === 'settled' && (
          <View style={styles.settledPill}>
            <Text style={styles.settledText}>You paid full</Text>
          </View>
        )}

        {badgeType === 'none' && (
          <Text style={styles.notInvolvedText}>Not involved</Text>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: moderateScale(16),
    padding: moderateScale(14),
    marginBottom: moderateScale(10),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...SHADOWS.soft,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: moderateScale(10),
  },
  iconContainer: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },
  subtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  timeText: {
    fontSize: moderateScale(11),
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  rightGroup: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalAmount: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.navy,
  },
  getBackPill: {
    backgroundColor: '#E8FAF3',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(4),
  },
  getBackText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: COLORS.incomeDark,
  },
  owePill: {
    backgroundColor: '#FFE9EC',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(4),
  },
  oweText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: COLORS.expenseDark,
  },
  settledPill: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(8),
    marginTop: moderateScale(4),
  },
  settledText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  notInvolvedText: {
    fontSize: moderateScale(11),
    color: COLORS.textMuted,
    marginTop: moderateScale(4),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
});

export default GroupExpenseCard;
