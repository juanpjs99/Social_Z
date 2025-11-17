import { Platform, ToastAndroid, Alert } from 'react-native';

let isReady = false;
export const markAppReady = () => { isReady = true; };

export function showMessage(title, message, options = {}) {
  // Avoid firing Alert too early in Android bridgeless: use Toast when possible
  if (Platform.OS === 'android') {
    if (!isReady) {
      // queue using toast to prevent "not attached to Activity"
      ToastAndroid.show(`${title}: ${message}`, ToastAndroid.LONG);
      return;
    }
    if (options.toast) {
      ToastAndroid.show(message || title, ToastAndroid.SHORT);
      return;
    }
    // Fallback to Alert
    try {
      Alert.alert(title, message);
    } catch (e) {
      ToastAndroid.show(`${title}: ${message}`, ToastAndroid.LONG);
    }
  } else {
    Alert.alert(title, message);
  }
}
