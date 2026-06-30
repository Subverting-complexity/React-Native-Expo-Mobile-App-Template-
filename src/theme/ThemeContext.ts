import { createContext } from 'react';
import type { ThemeTokens } from './themes';

// StorageAdapter is defined once in the storage module (the persistence port)
// and re-exported here so theme consumers keep importing it from `@/theme`.
export type { StorageAdapter } from '@/storage';

export type ColorMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: ThemeTokens;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
