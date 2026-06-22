import React from 'react';
import { Text } from 'react-native';
import { render, act, waitFor } from '@testing-library/react-native';

import { ThemeProvider } from '../ThemeProvider';
import { useTheme } from '../useTheme';
import { ThemeContext } from '../ThemeContext';
import type { StorageAdapter, ColorMode } from '../ThemeContext';
import { lightTheme, darkTheme } from '../index';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function makeStorage(initial?: ColorMode): StorageAdapter {
  const store: Record<string, string> = {};
  if (initial) store['@theme/colorMode'] = initial;
  return {
    getItem: jest.fn(async (key) => store[key] ?? null),
    setItem: jest.fn(async (key, value) => {
      store[key] = value;
    }),
  };
}

let mockColorScheme: 'light' | 'dark' | null = 'dark';
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: () => mockColorScheme,
}));

// --------------------------------------------------------------------------
// Consumer component for hook tests
// --------------------------------------------------------------------------

function Consumer() {
  const { theme, colorMode, setColorMode } = useTheme();
  return (
    <>
      <Text testID="bg">{theme.colors.background}</Text>
      <Text testID="mode">{colorMode}</Text>
      <Text testID="set" onPress={() => setColorMode('light')}>
        setLight
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
