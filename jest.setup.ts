// Global Jest setup.
//
// AsyncStorage (v2, the version Expo SDK 56 bundles) reaches for its native
// module at import time, which throws under Jest where no native module is
// linked. The library ships an in-memory mock for exactly this case; register
// it once here so every test that imports AsyncStorage — directly or
// transitively through ThemeProvider — gets the stub. Defined in one place per
// the single-source-of-truth rule rather than re-mocked in each test file.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
