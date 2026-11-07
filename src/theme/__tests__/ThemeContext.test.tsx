import React from 'react';
import { Text } from 'react-native';
import { render, act, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '../ThemeProvider';
import { useTheme } from '../useTheme';
import { ThemeContext } from '../ThemeContext';
import type { ColorMode } from '../ThemeContext';
import { THEMES } from '../themes';
import { makeStorageWithStore } from '@/test';

const { light: lightTheme, dark: darkTheme } = THEMES.standard;
const { light: highContrastLightTheme, dark: highContrastDarkTheme } =
  THEMES.highContrast;

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function makeStorage(initial?: ColorMode, themeName?: string) {
  return makeStorageWithStore({
    ...(initial ? { '@theme/colorMode': initial } : {}),
    ...(themeName ? { '@theme/name': themeName } : {}),
  });
}

let mockColorScheme: 'light' | 'dark' | null = 'dark';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => mockColorScheme,
}));

// --------------------------------------------------------------------------
// Consumer component for hook tests
// --------------------------------------------------------------------------

function Consumer() {
  const {
    theme,
    colorMode,
    colorScheme,
    setColorMode,
    themeName,
    setThemeName,
    hydrated,
  } = useTheme();
  return (
    <>
      <Text testID="bg">{theme.colors.background}</Text>
      <Text testID="mode">{colorMode}</Text>
      <Text testID="scheme">{colorScheme}</Text>
      <Text testID="hydrated">{String(hydrated)}</Text>
      <Text testID="set" onPress={() => setColorMode('light')}>
        setLight
      </Text>
      <Text testID="theme-name">{themeName}</Text>
      <Text
        testID="set-high-contrast"
        onPress={() => setThemeName('highContrast')}
      >
        setHighContrast
      </Text>
    </>
  );
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('ThemeProvider', () => {
  beforeEach(() => {
    mockColorScheme = 'dark';
  });

  it('provides a theme matching the system scheme by default', async () => {
    mockColorScheme = 'light';
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage()}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('bg').props.children).toBe(
        lightTheme.colors.background,
      ),
    );
  });

  it('defaults to dark theme when system scheme is dark', async () => {
    mockColorScheme = 'dark';
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage()}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('bg').props.children).toBe(
        darkTheme.colors.background,
      ),
    );
  });

  it('loads persisted preference from storage on mount', async () => {
    const storage = makeStorage('light');
    const { getByTestId } = render(
      <ThemeProvider storage={storage}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('mode').props.children).toBe('light'),
    );
    expect(getByTestId('bg').props.children).toBe(lightTheme.colors.background);
  });

  it('persists the new mode when setColorMode is called', async () => {
    const storage = makeStorage();
    const { getByTestId } = render(
      <ThemeProvider storage={storage}>
        <Consumer />
      </ThemeProvider>,
    );
    await act(async () => {
      getByTestId('set').props.onPress();
    });
    expect(storage.setItem).toHaveBeenCalledWith('@theme/colorMode', 'light');
    await waitFor(() =>
      expect(getByTestId('mode').props.children).toBe('light'),
    );
  });

  it('exposes lightTheme when mode is "light"', async () => {
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage('light')}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('bg').props.children).toBe(
        lightTheme.colors.background,
      ),
    );
  });

  it('exposes darkTheme when mode is "dark"', async () => {
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage('dark')}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('bg').props.children).toBe(
        darkTheme.colors.background,
      ),
    );
  });

  it('resolves the system mode to the OS scheme in colorScheme', async () => {
    mockColorScheme = 'light';
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage('system')}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('hydrated').props.children).toBe('true'),
    );
    expect(getByTestId('scheme').props.children).toBe('light');
  });

  it('falls back to dark when system scheme is null and mode is system', async () => {
    mockColorScheme = null;
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage('system')}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('bg').props.children).toBe(
        darkTheme.colors.background,
      ),
    );
  });
});

describe('ThemeProvider themes', () => {
  beforeEach(() => {
    mockColorScheme = 'dark';
  });

  it('uses Standard by default', async () => {
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage('dark')}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('bg').props.children).toBe(
        darkTheme.colors.background,
      ),
    );
    expect(getByTestId('theme-name').props.children).toBe('standard');
  });

  it('uses the dark version of a persisted High contrast in dark mode', async () => {
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage('dark', 'highContrast')}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('bg').props.children).toBe(
        highContrastDarkTheme.colors.background,
      ),
    );
  });

  it('uses the light version of a persisted High contrast in light mode', async () => {
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage('light', 'highContrast')}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('bg').props.children).toBe(
        highContrastLightTheme.colors.background,
      ),
    );
  });

  it('ignores a persisted theme name that is not known', async () => {
    const storage = makeStorage('dark', 'sepia');
    const { getByTestId } = render(
      <ThemeProvider storage={storage}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('hydrated').props.children).toBe('true'),
    );
    expect(getByTestId('theme-name').props.children).toBe('standard');
  });

  it('applies and persists a new theme', async () => {
    const storage = makeStorage('dark');
    const { getByTestId } = render(
      <ThemeProvider storage={storage}>
        <Consumer />
      </ThemeProvider>,
    );
    await act(async () => {
      getByTestId('set-high-contrast').props.onPress();
    });
    expect(storage.setItem).toHaveBeenCalledWith('@theme/name', 'highContrast');
    expect(getByTestId('bg').props.children).toBe(
      highContrastDarkTheme.colors.background,
    );
  });
});

describe('ThemeProvider hydration', () => {
  beforeEach(() => {
    mockColorScheme = 'dark';
  });

  it('is not hydrated before the saved choices are read', async () => {
    const { getByTestId } = render(
      <ThemeProvider storage={makeStorage('light', 'highContrast')}>
        <Consumer />
      </ThemeProvider>,
    );
    expect(getByTestId('hydrated').props.children).toBe('false');
    await waitFor(() =>
      expect(getByTestId('hydrated').props.children).toBe('true'),
    );
  });

  it('applies the saved theme in the same render that reports hydrated', async () => {
    const seen: string[] = [];
    function Recorder() {
      const { hydrated, themeName, theme } = useTheme();
      if (hydrated) {
        seen.push(`${themeName}:${theme.colors.background}`);
      }
      return null;
    }
    render(
      <ThemeProvider storage={makeStorage('light', 'highContrast')}>
        <Recorder />
      </ThemeProvider>,
    );
    await waitFor(() => expect(seen.length).toBeGreaterThan(0));
    expect(seen[0]).toBe(
      `highContrast:${highContrastLightTheme.colors.background}`,
    );
  });
});

describe('ThemeProvider storage edge cases', () => {
  beforeEach(() => {
    mockColorScheme = 'dark';
  });

  it('ignores a persisted colour mode that is not known', async () => {
    const storage = makeStorageWithStore({ '@theme/colorMode': 'sepia' });
    const { getByTestId } = render(
      <ThemeProvider storage={storage}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('hydrated').props.children).toBe('true'),
    );
    expect(getByTestId('mode').props.children).toBe('system');
  });

  it('keeps the defaults when storage cannot be read', async () => {
    const storage = {
      getItem: jest.fn(() => Promise.reject(new Error('read failed'))),
      setItem: jest.fn(async () => {}),
    };
    const { getByTestId } = render(
      <ThemeProvider storage={storage}>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('hydrated').props.children).toBe('true'),
    );
    expect(getByTestId('mode').props.children).toBe('system');
    expect(getByTestId('theme-name').props.children).toBe('standard');
  });

  it('still applies a choice when storage cannot save it', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const storage = {
      getItem: jest.fn(async () => null),
      setItem: jest.fn(() => Promise.reject(new Error('write failed'))),
    };
    const { getByTestId } = render(
      <ThemeProvider storage={storage}>
        <Consumer />
      </ThemeProvider>,
    );
    await act(async () => {
      getByTestId('set-high-contrast').props.onPress();
    });
    expect(storage.setItem).toHaveBeenCalledWith('@theme/name', 'highContrast');
    expect(getByTestId('theme-name').props.children).toBe('highContrast');
    expect(warn).toHaveBeenCalledWith(
      'Could not save @theme/name',
      expect.any(Error),
    );
    warn.mockRestore();
  });

  it('keeps a choice made before the saved value has loaded', async () => {
    const pending: Record<string, (value: string | null) => void> = {};
    const storage = {
      getItem: jest.fn(
        (key: string) =>
          new Promise<string | null>((resolve) => {
            pending[key] = resolve;
          }),
      ),
      setItem: jest.fn(async () => {}),
    };
    const { getByTestId } = render(
      <ThemeProvider storage={storage}>
        <Consumer />
      </ThemeProvider>,
    );

    await act(async () => {
      getByTestId('set').props.onPress();
    });
    await act(async () => {
      pending['@theme/colorMode']('dark');
    });

    expect(getByTestId('mode').props.children).toBe('light');
  });
});

describe('useTheme', () => {
  it('throws when called outside ThemeProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      'useTheme must be called inside <ThemeProvider>',
    );
    spy.mockRestore();
  });
});

describe('ThemeContext', () => {
  it('is null by default (without provider)', () => {
    function Capture() {
      const value = React.useContext(ThemeContext);
      return <Text testID="ctx">{value === null ? 'null' : 'present'}</Text>;
    }
    const { getByTestId } = render(<Capture />);
    expect(getByTestId('ctx').props.children).toBe('null');
  });
});
