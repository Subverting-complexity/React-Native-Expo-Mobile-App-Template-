import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import RootLayout, { ErrorBoundary } from '../../app/_layout';
import { mockReduceMotion } from '../../src/test';

// The saved theme choices the provider's default storage returns.
let mockSaved: Record<string, string> = {};
// The theme name each render of the screen saw, in order.
const mockRenderedThemes: string[] = [];

jest.mock('@/storage', () => ({
  ...jest.requireActual('@/storage'),
  storage: {
    getItem: jest.fn(async (key: string) => mockSaved[key] ?? null),
    setItem: jest.fn(async () => {}),
  },
}));

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  function Stack() {
    const { useTheme } = jest.requireActual('@/theme');
    const { themeName } = useTheme();
    mockRenderedThemes.push(themeName);
    return React.createElement(Text, { testID: 'stack' }, themeName);
  }
  return { Stack };
});

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => {}),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: jest.fn(() => null),
}));

jest.mock('@/hooks', () => ({
  useAppFonts: jest.fn(),
}));

const mockUseAppFonts = jest.requireMock<{ useAppFonts: jest.Mock }>(
  '@/hooks',
).useAppFonts;

describe('RootLayout', () => {
  beforeEach(() => {
    mockReduceMotion(false);
    mockSaved = {};
    mockRenderedThemes.length = 0;
    jest.mocked(SplashScreen.hideAsync).mockClear();
    jest.mocked(StatusBar).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps the splash screen up from module load', () => {
    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();
  });

  it('renders nothing, and keeps the splash screen, while fonts are loading', async () => {
    mockUseAppFonts.mockReturnValue([false, null]);
    const { toJSON } = render(<RootLayout />);
    await waitFor(() => expect(toJSON()).toBeNull());
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it('renders the stack and hides the splash screen once fonts and theme are ready', async () => {
    mockUseAppFonts.mockReturnValue([true, null]);
    const { findByTestId } = render(<RootLayout />);
    await findByTestId('stack');
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  it('renders the stack when font loading fails (graceful degradation)', async () => {
    mockUseAppFonts.mockReturnValue([false, new Error('Font load failed')]);
    const { findByTestId } = render(<RootLayout />);
    await findByTestId('stack');
  });

  it('first renders the screen in a saved theme that is not the default', async () => {
    mockSaved = { '@theme/name': 'highContrast' };
    mockUseAppFonts.mockReturnValue([true, null]);
    const { findByTestId } = render(<RootLayout />);
    await findByTestId('stack');
    expect(mockRenderedThemes[0]).toBe('highContrast');
  });

  it.each([
    ['dark', 'light'],
    ['light', 'dark'],
  ])(
    'gives the status bar contrasting content in the saved %s mode',
    async (mode, style) => {
      mockSaved = { '@theme/colorMode': mode };
      mockUseAppFonts.mockReturnValue([true, null]);
      const { findByTestId } = render(<RootLayout />);
      await findByTestId('stack');
      expect(jest.mocked(StatusBar).mock.lastCall?.[0]).toEqual({ style });
    },
  );
});

describe('ErrorBoundary', () => {
  it('shows the error and retries when the user asks', () => {
    const retry = jest.fn(async () => {});
    const { getByText, getByRole } = render(
      <ErrorBoundary error={new Error('Network down')} retry={retry} />,
    );
    getByText(/Network down/);
    fireEvent.press(getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
