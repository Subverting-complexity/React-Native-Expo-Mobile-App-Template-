import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageAdapter } from './types';

/**
 * Native (iOS/Android) preference storage backed by AsyncStorage, the
 * persistent key-value store Expo bundles for native platforms. Wrapped behind
 * the StorageAdapter port so callers depend on the contract, not the backend.
 */
export const nativeStorage: StorageAdapter = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
};
