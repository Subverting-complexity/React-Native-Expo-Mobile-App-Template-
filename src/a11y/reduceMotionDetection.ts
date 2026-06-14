import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Tracks the OS "reduce motion" accessibility preference. Reads the initial
 * value once on mount and stays in sync via the `reduceMotionChanged` event,
 * cleaning up the subscription on unmount.
 *
 * Returned through {@link A11yContext} by the provider; components and
 * animations consume it via `useReduceMotion()` to drop or shorten motion.
 */
export function useReduceMotionDetection(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Default to false (motion allowed) if the platform query rejects, so a
    // failed probe never leaves an unhandled rejection or a stuck state.
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => {
        if (mounted) {
          setReduceMotion(false);
        }
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
