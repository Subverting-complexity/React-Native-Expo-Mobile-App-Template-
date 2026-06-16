import AsyncStorage from '@react-native-async-storage/async-storage';

import { nativeStorage } from '../nativeStorage';

// AsyncStorage is replaced with its in-memory mock globally (jest.setup.ts).
describe('nativeStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('round-trips a written value through AsyncStorage', async () => {
    await nativeStorage.setItem('color', 'blue');
    await expect(nativeStorage.getItem('color')).resolves.toBe('blue');
  });

  it('returns null for an unknown key', async () => {
    await expect(nativeStorage.getItem('missing')).resolves.toBeNull();
  });

  it('delegates writes to AsyncStorage', async () => {
    await nativeStorage.setItem('color', 'green');
    await expect(AsyncStorage.getItem('color')).resolves.toBe('green');
  });
});
