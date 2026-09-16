import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { COLORS } from '../../utils/colors';

const ProfileScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged Out', 'You have been logged out successfully.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user?.displayName && <Text style={styles.name}>{user.displayName}</Text>}
      {user?.email && <Text style={styles.email}>{user.email}</Text>}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.mintLight,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.petrolDark,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.petrol,
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 30,
  },
  logoutBtn: {
    backgroundColor: COLORS.red,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});