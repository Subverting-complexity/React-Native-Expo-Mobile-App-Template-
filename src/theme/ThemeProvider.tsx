import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { storage as defaultStorage } from '@/storage';
import { lightTheme, darkTheme } from './themes';
import {
  ThemeContext,
  type ColorMode,
  type StorageAdapter,
} from './ThemeContext';

const STORAGE_KEY = '@theme/colorMode';

interface ThemeProviderProps {
  children: ReactNode;
  storage?: StorageAdapter;
}

export function ThemeProvider({
  children,
  storage = defaultStorage,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [colorMode, setColorModeState] = useState<ColorMode>('system');

  useEffect(() => {
    storage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setColorModeState(saved);
      }
    });
  }, [storage]);

  const setColorMode = useCallback(
    (mode: ColorMode) => {
      setColorModeState(mode);
      storage.setItem(STORAGE_KEY, mode);
    },
    [storage],
  );

  const resolvedScheme =
    colorMode === 'system' ? (systemScheme ?? 'dark') : colorMode;
  const theme = resolvedScheme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, colorMode, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
