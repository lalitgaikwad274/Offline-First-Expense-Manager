import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  deleteGroup,
  getGroupById,
  updateGroup,
} from '../../store/groupExpenseSlice';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';

export const GroupSettingsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const groupId = route.params?.groupId;
  const group = useAppSelector(getGroupById(groupId));
  const currentUser = useAppSelector((state) => state.groupExpense.currentUser);

  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [simplifyDebts, setSimplifyDebts] = useState(group?.simplifyDebts !== false);

  if (!group) {
    return (
      <View style={[styles.safeArea, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.expense, fontSize: 16 }}>Group not found</Text>
      </View>
    );
  }

  const isOwner = group.createdBy === currentUser.id;

  const handleSaveInfo = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Group name cannot be empty');
      return;
    }

    dispatch(
      updateGroup({
        ...group,
        name: name.trim(),
        description: description.trim() || undefined,
        simplifyDebts,
      })
    );
    Alert.alert('Updated', 'Group settings saved successfully.');
  };

  const handleToggleSimplify = (val: boolean) => {
    setSimplifyDebts(val);
    dispatch(
      updateGroup({
        ...group,
        simplifyDebts: val,
      })
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone and will delete all group expenses.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Group',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteGroup(group.id));
            navigation.navigate(SCREEN_NAMES.GROUP_EXPENSES);
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      `Are you sure you want to leave "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteGroup(group.id));
            navigation.navigate(SCREEN_NAMES.GROUP_EXPENSES);
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Group Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Group Information Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Group information</Text>

          <Text style={styles.inputLabel}>Group name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            onBlur={handleSaveInfo}
          />

          <Text style={[styles.inputLabel, { marginTop: moderateScale(12) }]}>
            Description
          </Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            onBlur={handleSaveInfo}
          />

          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Currency</Text>
            <Text style={styles.rowValue}>INR (₹)</Text>
          </View>
        </View>

        {/* Expense Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Expense settings</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <View style={styles.switchTitleRow}>
                <Sparkles size={moderateScale(16)} color={COLORS.primary} />
                <Text style={styles.switchTitle}>Simplify debts</Text>
              </View>
              <Text style={styles.switchSubtitle}>
                Automatically combines debts to minimize transactions
              </Text>
            </View>
            <Switch
              value={simplifyDebts}
              onValueChange={handleToggleSimplify}
              trackColor={{ false: '#E2E8F0', true: COLORS.primaryLight }}
              thumbColor={simplifyDebts ? COLORS.primary : '#FFFFFF'}
            />
          </View>

          <View style={[styles.rowItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Default split</Text>
            <Text style={styles.rowValue}>Equal</Text>
          </View>
        </View>

        {/* Members Quick Access */}
        <View style={styles.sectionCard}>
          <Pressable
            onPress={() =>
              navigation.navigate(SCREEN_NAMES.GROUP_MEMBERS, { groupId: group.id })
            }
            style={styles.membersRow}
          >
            <View style={styles.membersRowLeft}>
              <Users size={moderateScale(20)} color={COLORS.primary} />
              <Text style={styles.membersRowText}>Members</Text>
            </View>
            <View style={styles.membersRowRight}>
              <Text style={styles.membersCountText}>
                {group.members.length} members
              </Text>
              <ChevronRight size={moderateScale(18)} color={COLORS.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={[styles.sectionCard, styles.dangerZoneCard]}>
          <View style={styles.dangerHeader}>
            <AlertTriangle size={moderateScale(18)} color={COLORS.expense} />
            <Text style={styles.dangerTitle}>Danger zone</Text>
          </View>

          <TouchableOpacity
            onPress={handleLeaveGroup}
            style={styles.dangerButton}
          >
            <LogOut size={moderateScale(18)} color={COLORS.expense} />
            <Text style={styles.dangerButtonText}>Leave group</Text>
          </TouchableOpacity>

          {isOwner && (
            <TouchableOpacity
              onPress={handleDeleteGroup}
              style={[styles.dangerButton, { marginTop: moderateScale(10) }]}
            >
              <Trash2 size={moderateScale(18)} color={COLORS.expense} />
              <Text style={styles.dangerButtonText}>Delete group</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
    paddingBottom: moderateScale(40),
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginBottom: moderateScale(14),
    ...SHADOWS.soft,
  },
  sectionHeading: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: moderateScale(12),
  },
  inputLabel: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(6),
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
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
    marginTop: moderateScale(4),
  },
  rowLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.navy,
  },
  rowValue: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  switchTextGroup: {
    flex: 1,
    marginRight: moderateScale(12),
  },
  switchTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
  },
  switchSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  membersRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  membersRowText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
  },
  membersRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membersCountText: {
    fontSize: moderateScale(13),
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  dangerZoneCard: {
    borderColor: '#FFE3E5',
    borderWidth: 1,
    backgroundColor: '#FFF9F9',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginBottom: moderateScale(14),
  },
  dangerTitle: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: COLORS.expense,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    height: moderateScale(46),
    gap: moderateScale(8),
    borderWidth: 1,
    borderColor: '#FFD6D9',
  },
  dangerButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.expense,
  },
});

export default GroupSettingsScreen;
