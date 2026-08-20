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

// Make Animated.timing synchronous under Jest. React Native's JS-driven
// animations run their default easing on a requestAnimationFrame loop, and
// in the test environment those frames can fire AFTER Jest tears the
// environment down, dereferencing the now-undefined easing module
// ("TypeError: _bezier is not a function") and crashing the worker with no
// assertion failure to point at. It is timing-sensitive, so it surfaces
// mainly on slower CI runners — the worst kind of flake. The spy applies the
// final value and invokes the completion callback synchronously, scheduling
// no frames, so nothing can outlive a test. No suite asserts on animation
// progression, so this only makes tests deterministic.
import { Animated } from 'react-native';

jest.spyOn(Animated, 'timing').mockImplementation((value, config) => ({
  start: (callback?: Animated.EndCallback) => {
    if (typeof config.toValue === 'number') {
      (value as Animated.Value).setValue(config.toValue);
    }
    callback?.({ finished: true });
  },
  stop: () => {},
  reset: () => {},
}));
