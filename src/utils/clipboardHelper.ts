import { Clipboard, ToastAndroid, Platform, Alert } from 'react-native';

/**
 * Copies text to device clipboard with user feedback (Toast on Android, Alert on iOS)
 */
export const copyToClipboard = (text: string, message: string = 'Copied to clipboard'): boolean => {
  try {
    if (!text) {
      return false;
    }

    if (Clipboard && typeof Clipboard.setString === 'function') {
      Clipboard.setString(text);
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Copied', message);
      }
      return true;
    } else {
      console.warn('Clipboard.setString is not available.');
      return false;
    }
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error);
    return false;
  }
};
