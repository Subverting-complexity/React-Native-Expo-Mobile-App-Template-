import { Platform } from 'react-native';

import { nativeStorage } from './nativeStorage';
import { webStorage } from './webStorage';
import type { StorageAdapter } from './types';

/**
 * Platform-resolved preference storage: localStorage on web, AsyncStorage on
 * native. This is the default persistence layer the app should use; the
 * concrete adapter is chosen once at module load from the running platform.
 */
export const storage: StorageAdapter =
  Platform.OS === 'web' ? webStorage : nativeStorage;

export type { StorageAdapter, WebStorageLike } from './types';
export { createWebStorage, webStorage } from './webStorage';
export { nativeStorage } from './nativeStorage';
