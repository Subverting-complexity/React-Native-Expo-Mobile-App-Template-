import { useMemo, type ReactNode } from 'react';

import { A11yContext } from './A11yContext';
import { MAX_FONT_SIZE_MULTIPLIER } from './maxFontScale';
import { useReduceMotionDetection } from './reduceMotionDetection';

interface A11yProviderProps {
  children: ReactNode;
}

/**
 * Provides accessibility state (reduce-motion preference, font-scale cap) to
 * the tree. Wrap the app root in this alongside `ThemeProvider`.
 */
export function A11yProvider({ children }: A11yProviderProps) {
  const reduceMotion = useReduceMotionDetection();
  // A stable value, so consumers re-render only when the preference changes.
  const value = useMemo(
    () => ({ reduceMotion, maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER }),
    [reduceMotion],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}
