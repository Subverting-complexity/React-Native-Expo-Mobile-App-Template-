import { createContext } from 'react';

/**
 * Accessibility state shared across the app. Kept separate from the theme
 * context because a11y preferences are a distinct concern from visual tokens.
 */
export interface A11yContextValue {
  /** True when the OS "reduce motion" preference is enabled. */
  reduceMotion: boolean;
  /** The global cap applied to user font scaling (single source of truth). */
  maxFontSizeMultiplier: number;
}

export const A11yContext = createContext<A11yContextValue | null>(null);
