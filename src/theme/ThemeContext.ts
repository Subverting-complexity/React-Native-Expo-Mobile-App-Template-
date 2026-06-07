import { createContext } from 'react';
import type { ThemeTokens } from './index';

export type ColorMode = 'light' | 'dark' | 'system';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface ThemeContextValue {
  theme: ThemeTokens;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
