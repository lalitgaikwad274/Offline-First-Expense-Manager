import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Camera,
  Check,
  Plus,
  Search,
  Smile,
  UserPlus,
  Users,
  X,
} from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../store';
// import { createGroup } from '../../store/groupExpenseSlice';
import { Group, GroupMember } from '../../types/groupExpense';
import { CONTACTS_POOL } from '../../utils/groupExpense/mockData';
import { COLORS, SHADOWS, SPACING, moderateScale } from '../../utils/constants';
import { SCREEN_NAMES } from '../../utils/screenNames';
import SplitMemberRow from '../../components/groupExpense/SplitMemberRow';
import { createGroup } from '../../store/api';

const EMOJI_AVATARS = ['🌴', '🏠', '🍕', '💼', '✈️', '🎉', '🚗', '☕', '🏕️', '🎮', '🏖️', '🍔'];

export const CreateGroupScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  const currentUser = useAppSelector((state) => state.groupExpense.currentUser);

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🌴');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Available contacts (including current user and pre-defined contacts)
  const [contacts, setContacts] = useState<GroupMember[]>(() => {
    const list = [...CONTACTS_POOL];
    if (!list.some((c) => c.id === currentUser.id)) {
      list.unshift(currentUser);
    }
    return list;
  });

  // Selected member IDs - current user is always included by default
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([
    currentUser.id,
    CONTACTS_POOL[1].id, // Rahul
    CONTACTS_POOL[2].id, // Sonali
  ]);

  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // Custom Add Member Modal state
  const [showAddCustomMember, setShowAddCustomMember] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  const filteredContacts = useMemo(() => {
    if (!searchMemberQuery.trim()) return contacts;
    const q = searchMemberQuery.toLowerCase().trim();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [contacts, searchMemberQuery]);

  const handleToggleMember = (memberId: string) => {
    if (memberId === currentUser.id) {
      // Current user should always be in the group
      return;
    }
    setSelectedMemberIds((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleAddCustomMember = () => {
    if (!customName.trim()) {
      Alert.alert('Missing Name', 'Please enter member name');
      return;
    }

    const newId = `user_${Date.now()}`;
    const initials = customName
      .trim()
      .split(' ')
      .map((p) => p[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2);

    const newMember: GroupMember = {
      id: newId,
      name: customName.trim(),
      phone: customPhone.trim() || undefined,
      initials: initials || 'U',
      color: '#339AF0',
    };

    setContacts((prev) => [...prev, newMember]);
    setSelectedMemberIds((prev) => [...prev, newId]);
    setCustomName('');
    setCustomPhone('');
    setShowAddCustomMember(false);
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      Alert.alert('Validation Error', 'Please enter a group name');
      return;
    }

    if (selectedMemberIds.length < 2) {
      Alert.alert(
        'Validation Error',
        'At least 2 members are required to create a group'
      );
      return;
    }

    const selectedMembers = contacts.filter((c) =>
      selectedMemberIds.includes(c.id)
    );
    const groupmemberArray = selectedMembers.map((member) => ({
      name: member.name,
      phoneNumber: member.phone,
      role: 'member',
    }));
    const newGroup: Group = {
      id: `${Date.now()}`,
      name: groupName.trim(),
      description: description.trim() || undefined,
      icon: selectedEmoji,
      members: groupmemberArray,
    };

    console.log("####### newGroup", newGroup)
    dispatch(createGroup(newGroup))
    // dispatch(createGroup(newGroup));
    navigation.replace(SCREEN_NAMES.GROUP_DETAILS, { groupId: newGroup.id });
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
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Group Avatar Picker */}
        <View style={styles.avatarSection}>
          <Pressable
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarEmoji}>{selectedEmoji}</Text>
            <View style={styles.cameraBadge}>
              <Camera size={moderateScale(14)} color={COLORS.white} strokeWidth={2.5} />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Tap icon to change avatar</Text>
        </View>

        {/* Emoji selector grid if open */}
        {showEmojiPicker && (
          <View style={styles.emojiGrid}>
            {EMOJI_AVATARS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => {
                  setSelectedEmoji(emoji);
                  setShowEmojiPicker(false);
                }}
                style={[
                  styles.emojiItem,
                  selectedEmoji === emoji && styles.emojiItemSelected,
                ]}
              >
                <Text style={styles.emojiGridText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Group name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Goa Trip"
            placeholderTextColor={COLORS.textMuted}
            value={groupName}
            onChangeText={setGroupName}
          />

          <Text style={[styles.inputLabel, { marginTop: moderateScale(16) }]}>
            Description (optional)
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Goa trip expenses & stay"
            placeholderTextColor={COLORS.textMuted}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Add Members Section */}
        <View style={styles.membersSection}>
          <View style={styles.membersHeaderRow}>
            <Text style={styles.sectionTitle}>Add members</Text>
            <Text style={styles.membersCountBadge}>
              {selectedMemberIds.length} selected
            </Text>
          </View>

          {/* Member search bar */}
          <View style={styles.searchBar}>
            <Search size={moderateScale(18)} color={COLORS.textMuted} />
            <TextInput
              style={styles.memberSearchInput}
              placeholder="Search by name or phone number"
              placeholderTextColor={COLORS.textMuted}
              value={searchMemberQuery}
              onChangeText={setSearchMemberQuery}
            />
            {searchMemberQuery.length > 0 && (
              <Pressable onPress={() => setSearchMemberQuery('')} hitSlop={6}>
                <X size={moderateScale(16)} color={COLORS.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Contact List */}
          <View style={styles.contactsCard}>
            {filteredContacts.map((item) => (
              <SplitMemberRow
                key={item.id}
                member={item}
                mode="checkbox"
                isSelected={selectedMemberIds.includes(item.id)}
                onToggleSelect={handleToggleMember}
              />
            ))}

            {/* + Add Member Custom Button */}
            <Pressable
              onPress={() => setShowAddCustomMember(true)}
              style={({ pressed }) => [
                styles.addCustomMemberRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.addCustomIconCircle}>
                <Plus size={moderateScale(18)} color={COLORS.primary} strokeWidth={2.5} />
              </View>
              <Text style={styles.addCustomText}>Add member</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          onPress={handleCreate}
          style={styles.createButton}
          activeOpacity={0.88}
        >
          <Text style={styles.createButtonText}>Create group</Text>
        </TouchableOpacity>
      </View>

      {/* Modal to add custom contact */}
      <Modal
        visible={showAddCustomMember}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCustomMember(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Member</Text>
              <Pressable
                onPress={() => setShowAddCustomMember(false)}
                hitSlop={8}
              >
                <X size={moderateScale(20)} color={COLORS.navy} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor={COLORS.textMuted}
              value={customName}
              onChangeText={setCustomName}
              autoFocus
            />

            <Text style={[styles.inputLabel, { marginTop: moderateScale(12) }]}>
              Phone Number (optional)
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="+91 98765 43210"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={customPhone}
              onChangeText={setCustomPhone}
            />

            <TouchableOpacity
              onPress={handleAddCustomMember}
              style={styles.modalAddButton}
            >
              <Text style={styles.modalAddButtonText}>Add to Group</Text>
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
    paddingVertical: moderateScale(14),
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
    paddingBottom: moderateScale(100),
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: moderateScale(14),
  },
  avatarCircle: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#E8F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D0EEF2',
    position: 'relative',
    ...SHADOWS.soft,
  },
  avatarEmoji: {
    fontSize: moderateScale(38),
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHint: {
    fontSize: moderateScale(12),
    color: COLORS.textSecondary,
    marginTop: moderateScale(8),
    fontWeight: '500',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: moderateScale(8),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    marginBottom: moderateScale(16),
    ...SHADOWS.soft,
  },
  emojiItem: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  emojiItemSelected: {
    backgroundColor: '#E6F7F9',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emojiGridText: {
    fontSize: moderateScale(22),
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginBottom: moderateScale(20),
    ...SHADOWS.soft,
  },
  inputLabel: {
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
  membersSection: {
    marginBottom: moderateScale(20),
  },
  membersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.navy,
  },
  membersCountBadge: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.primaryDark,
    backgroundColor: '#E8F5F7',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(10),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(12),
    height: moderateScale(44),
    marginBottom: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E8EEF3',
  },
  memberSearchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: COLORS.navy,
    marginLeft: moderateScale(8),
    paddingVertical: 0,
  },
  contactsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    ...SHADOWS.soft,
  },
  addCustomMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(14),
    gap: moderateScale(12),
  },
  addCustomIconCircle: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#E8F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.primaryDark,
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
  createButton: {
    backgroundColor: '#07517D', // Dark teal matching reference image
    borderRadius: moderateScale(16),
    height: moderateScale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: COLORS.white,
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
  modalAddButton: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(14),
    height: moderateScale(48),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(20),
  },
  modalAddButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.white,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default CreateGroupScreen;
