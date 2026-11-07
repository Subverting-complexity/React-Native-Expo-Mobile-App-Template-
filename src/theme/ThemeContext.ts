import { createContext } from 'react';
import type { ThemeName, ThemeTokens } from './themes';

export const COLOR_MODES = ['light', 'dark', 'system'] as const;

export type ColorMode = (typeof COLOR_MODES)[number];

/** The visible label for each colour mode, which a screen reader also announces. */
export const COLOR_MODE_LABELS: Record<ColorMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export function isColorMode(value: unknown): value is ColorMode {
  return (
    typeof value === 'string' &&
    (COLOR_MODES as readonly string[]).includes(value)
  );
}

export interface ThemeContextValue {
  theme: ThemeTokens;
  colorMode: ColorMode;
  /** The scheme in use: `colorMode`, with `'system'` resolved to the OS scheme. */
  colorScheme: 'light' | 'dark';
  setColorMode: (mode: ColorMode) => void;
  /** The chosen theme from `THEMES`. `colorMode` picks its light or dark version. */
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  /** True once the saved choices are read, so `theme` is the saved theme. */
  hydrated: boolean;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
