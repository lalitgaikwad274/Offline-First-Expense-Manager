import React, { memo } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Landmark, Plus } from 'lucide-react-native';
import { COLORS, moderateScale } from '../utils/constants';

export interface NoBankAccountCardProps {
  onAddAccount?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const NoBankAccountCard: React.FC<NoBankAccountCardProps> = memo(
  ({ onAddAccount, style }) => {
    return (
      <View style={[styles.container, style]}>
        {/* Bank Icon */}
        <View style={styles.iconContainer}>
          <Landmark
            size={moderateScale(28)}
            color="#005D5B"
            strokeWidth={1.8}
          />
        </View>

        {/* Text Details */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {'No bank\naccount yet'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={3}>
            Add your first account to see your total balance here.
          </Text>
        </View>

        {/* Add Account Action Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddAccount}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Add Account"
        >
          <Plus
            size={moderateScale(14)}
            color="#FFFFFF"
            strokeWidth={2.5}
            style={styles.plusIcon}
          />
          <Text style={styles.buttonText}>Add Account</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(22),
    borderWidth: 1.5,
    borderColor: '#A8DDD7',
    borderStyle: 'dashed',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(16),
    marginBottom: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    backgroundColor: '#D0F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: moderateScale(14),
    marginRight: moderateScale(10),
    justifyContent: 'center',
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.navy,
    lineHeight: moderateScale(19),
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: moderateScale(11.5),
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: moderateScale(16),
    marginTop: moderateScale(4),
  },
  addButton: {
    backgroundColor: '#005D5B',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#005D5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  plusIcon: {
    marginRight: moderateScale(4),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12.5),
    fontWeight: '700',
  },
});

export default NoBankAccountCard;
