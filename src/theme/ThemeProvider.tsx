import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { storage as defaultStorage, type StorageAdapter } from '@/storage';
import {
  DEFAULT_THEME_NAME,
  THEMES,
  isThemeName,
  type ThemeName,
} from './themes';
import {
  ThemeContext,
  isColorMode,
  type ColorMode,
  type ThemeContextValue,
} from './ThemeContext';

const STORAGE_KEY = '@theme/colorMode';
const THEME_NAME_STORAGE_KEY = '@theme/name';

/** Read a saved choice. A missing or unknown value, or a failed read, gives null. */
async function readSaved<T>(
  storage: StorageAdapter,
  key: string,
  isValid: (value: unknown) => value is T,
): Promise<T | null> {
  try {
    const saved = await storage.getItem(key);
    return isValid(saved) ? saved : null;
  } catch {
    return null;
  }
}

/** Save a choice. A failed save is not fatal: the choice still applies until the app closes. */
function save(storage: StorageAdapter, key: string, value: string): void {
  storage.setItem(key, value).catch((error: unknown) => {
    if (__DEV__) {
      console.warn(`Could not save ${key}`, error);
    }
  });
}

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
  const [themeName, setThemeNameState] =
    useState<ThemeName>(DEFAULT_THEME_NAME);
  const [hydrated, setHydrated] = useState(false);
  // A choice made before the saved value loads must win over the saved value.
  const chosen = useRef({ colorMode: false, themeName: false });

  useEffect(() => {
    Promise.all([
      readSaved(storage, STORAGE_KEY, isColorMode),
      readSaved(storage, THEME_NAME_STORAGE_KEY, isThemeName),
    ]).then(([savedMode, savedName]) => {
      if (savedMode !== null && !chosen.current.colorMode) {
        setColorModeState(savedMode);
      }
      if (savedName !== null && !chosen.current.themeName) {
        setThemeNameState(savedName);
      }
      setHydrated(true);
    });
  }, [storage]);

  const setColorMode = useCallback(
    (mode: ColorMode) => {
      chosen.current.colorMode = true;
      setColorModeState(mode);
      save(storage, STORAGE_KEY, mode);
    },
    [storage],
  );

  const setThemeName = useCallback(
    (name: ThemeName) => {
      chosen.current.themeName = true;
      setThemeNameState(name);
      save(storage, THEME_NAME_STORAGE_KEY, name);
    },
    [storage],
  );

  const resolvedScheme = colorMode === 'system' ? systemScheme : colorMode;
  const colorScheme: ThemeContextValue['colorScheme'] =
    resolvedScheme === 'light' ? 'light' : 'dark';
  const theme = THEMES[themeName][colorScheme];

  const value = useMemo(
    () => ({
      theme,
      colorMode,
      colorScheme,
      setColorMode,
      themeName,
      setThemeName,
      hydrated,
    }),
    [
      theme,
      colorMode,
      colorScheme,
      setColorMode,
      themeName,
      setThemeName,
      hydrated,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
