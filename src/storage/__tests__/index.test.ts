import { storage } from '../index';

// `storage` is the platform-resolved adapter ThemeProvider persists through.
// jest-expo runs this suite once per platform project, so the round-trip below
// exercises the web adapter (localStorage) and the native adapter (AsyncStorage)
// in their respective environments — the proof that a preference persists on
// both web and native.
describe('platform storage', () => {
  it('exposes the StorageAdapter surface', () => {
    expect(typeof storage.getItem).toBe('function');
    expect(typeof storage.setItem).toBe('function');
  });

  it('round-trips a written preference', async () => {
    await storage.setItem('@storage/index-roundtrip', 'persisted');
    await expect(storage.getItem('@storage/index-roundtrip')).resolves.toBe(
      'persisted',
    );
  });

  it('returns null for a key that was never written', async () => {
    await expect(storage.getItem('@storage/never-written')).resolves.toBeNull();
  });
});
