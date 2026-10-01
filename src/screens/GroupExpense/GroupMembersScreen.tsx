import React, { useState } from 'react';
import {
  Alert,
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
import { ArrowLeft, Plus, Users, X } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  addGroupMember,
  getGroupById,
  getGroupExpenses,
  removeGroupMember,
} from '../../store/groupExpenseSlice';
import { GroupMember } from '../../types/groupExpense';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';
import MemberRow from '../../components/groupExpense/MemberRow';

export const GroupMembersScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const groupId = route.params?.groupId;
  const group = useAppSelector(getGroupById(groupId));
  const expenses = useAppSelector(getGroupExpenses(groupId));
  const currentUser = useAppSelector((state) => state.groupExpense.currentUser);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!group) {
    return (
      <View style={[styles.safeArea, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.expense, fontSize: 16 }}>Group not found</Text>
      </View>
    );
  }

  const handleAddMember = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter member name');
      return;
    }

    const newId = `user_${Date.now()}`;
    const initials = name
      .trim()
      .split(' ')
      .map((p) => p[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2);

    const newMember: GroupMember = {
      id: newId,
      name: name.trim(),
      phone: phone.trim() || undefined,
      initials: initials || 'U',
      color: '#339AF0',
    };

    dispatch(addGroupMember({ groupId: group.id, member: newMember }));
    setName('');
    setPhone('');
    setShowAddModal(false);
  };

  const handleRemoveMember = (member: GroupMember) => {
    const hasExpenses = expenses.some(
      (e) =>
        e.paidBy === member.id ||
        e.participants.some((p) => p.userId === member.id)
    );

    if (hasExpenses) {
      Alert.alert(
        'Cannot Remove Member',
        `${member.name} has active transactions in this group. Please delete or reassign those expenses before removing this member.`
      );
      return;
    }

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.name} from ${group.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(removeGroupMember({ groupId: group.id, memberId: member.id }));
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: topInset }]}>
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
        <Text style={styles.headerTitle}>Members</Text>
        <Pressable
          onPress={() => setShowAddModal(true)}
          hitSlop={12}
          style={styles.headerAddButton}
        >
          <Plus size={moderateScale(20)} color={COLORS.primary} strokeWidth={2.6} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>
          {group.members.length} {group.members.length === 1 ? 'member' : 'members'} in {group.name}
        </Text>

        {group.members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            canRemove={group.createdBy === currentUser.id}
            onRemove={handleRemoveMember}
          />
        ))}
      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Member</Text>
              <Pressable onPress={() => setShowAddModal(false)} hitSlop={8}>
                <X size={moderateScale(20)} color={COLORS.navy} />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <Text style={[styles.modalLabel, { marginTop: moderateScale(12) }]}>
              Phone number (optional)
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="+91 98765 43210"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TouchableOpacity
              onPress={handleAddMember}
              style={styles.modalAddBtn}
            >
              <Text style={styles.modalAddBtnText}>Add to Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  headerAddButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPaddingHorizontal,
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(40),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: moderateScale(14),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 27, 58, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenPaddingHorizontal,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
  },
  modalLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(6),
  },
  modalInput: {
    backgroundColor: '#F2F8FC',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(46),
    fontSize: moderateScale(15),
    color: COLORS.navy,
    borderWidth: 1,
    borderColor: '#E2ECF2',
  },
  modalAddBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(14),
    height: moderateScale(48),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(20),
  },
  modalAddBtnText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default GroupMembersScreen;
