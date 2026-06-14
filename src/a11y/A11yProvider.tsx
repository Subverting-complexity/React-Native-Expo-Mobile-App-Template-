import { type ReactNode } from 'react';

import { A11yContext } from './A11yContext';
import {
  applyGlobalFontScaleCap,
  MAX_FONT_SIZE_MULTIPLIER,
} from './maxFontScale';
import { useReduceMotionDetection } from './reduceMotionDetection';

// Install the global font-scale cap as the module loads, before any Text
// renders. Idempotent, so importing the provider anywhere is safe.
applyGlobalFontScaleCap();

interface A11yProviderProps {
  children: ReactNode;
}

/**
 * Provides accessibility state (reduce-motion preference, font-scale cap) to
 * the tree. Wrap the app root in this alongside `ThemeProvider`.
 */
export function A11yProvider({ children }: A11yProviderProps) {
  const reduceMotion = useReduceMotionDetection();

  return (
    <A11yContext.Provider
      value={{ reduceMotion, maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER }}
    >
      {children}
    </A11yContext.Provider>
  );
}
