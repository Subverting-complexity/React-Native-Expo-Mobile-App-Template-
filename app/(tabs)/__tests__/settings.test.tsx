import { AccessibilityInfo } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import SettingsScreen from '../settings';
import { A11yProvider } from '@/a11y';
import { ThemeProvider, type StorageAdapter } from '@/theme';

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

type SpyStorage = StorageAdapter & {
  getItem: jest.Mock;
  setItem: jest.Mock;
};

function makeStorage(initial: string | null = null): SpyStorage {
  return {
    getItem: jest.fn(async () => initial),
    setItem: jest.fn(async () => {}),
  };
}

function renderScreen(storage: StorageAdapter = makeStorage()) {
  return render(<SettingsScreen />, {
    wrapper: ({ children }) => (
      <SafeAreaProvider initialMetrics={METRICS}>
        <ThemeProvider storage={storage}>
          <A11yProvider>{children}</A11yProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    ),
  });
}

// Restore spied-on AccessibilityInfo methods around every test so the
// reduce-motion cases start from the original implementations.
beforeEach(() => {
  jest.restoreAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    renderScreen();
  });

  it('displays the Settings heading', () => {
    const { getByText } = renderScreen();
    getByText('Settings');
  });

  it('offers the three colour-mode options', () => {
    const { getByRole } = renderScreen();
    getByRole('button', { name: 'Light' });
    getByRole('button', { name: 'Dark' });
    getByRole('button', { name: 'System' });
  });

  it('marks the active mode (System) as selected by default', () => {
    const { getByRole } = renderScreen(makeStorage(null));
    const system = getByRole('button', { name: 'System' });
    expect(system.props.accessibilityState.selected).toBe(true);
  });

  it('persists and announces the chosen mode (reflects live)', () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    const storage = makeStorage(null);
    const { getByRole } = renderScreen(storage);

    fireEvent.press(getByRole('button', { name: 'Dark' }));

    // Persisted through the theme provider's storage seam...
    expect(storage.setItem).toHaveBeenCalledWith('@theme/colorMode', 'dark');
    // ...reflected live: the chosen chip is now the selected one...
    expect(
      getByRole('button', { name: 'Dark' }).props.accessibilityState.selected,
    ).toBe(true);
    // ...and announced for screen-reader users.
    expect(announce).toHaveBeenCalledWith('Theme set to Dark');
  });

  it('keeps the current mode when the active chip is re-tapped', () => {
    const storage = makeStorage(null);
    const { getByRole } = renderScreen(storage);

    // System is selected by default; re-tapping it would clear a normal
    // single-select group, but a colour mode must always be set, so the tap is
    // a no-op — the mode is unchanged and nothing is written to storage.
    fireEvent.press(getByRole('button', { name: 'System' }));

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(
      getByRole('button', { name: 'System' }).props.accessibilityState
        .selected,
    ).toBe(true);
  });

  it('adopts a persisted mode on load', async () => {
    const { getByRole } = renderScreen(makeStorage('light'));
    await waitFor(() =>
      expect(
        getByRole('button', { name: 'Light' }).props.accessibilityState
          .selected,
      ).toBe(true),
    );
  });

  it('shows the font-scale demonstration with the central cap', () => {
    const { getByText, getByTestId } = renderScreen();
    getByText(/Current scale:/);
    getByTestId('font-scale-sample');
  });

  it('indicates reduce motion is off by default', () => {
    const { getByTestId, getByText } = renderScreen();
    getByTestId('reduce-motion-indicator');
    getByText('Off');
  });

  it('reflects reduce motion when the OS preference is on', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockReturnValue({ remove: jest.fn() } as ReturnType<
        typeof AccessibilityInfo.addEventListener
      >);

    const { getByText } = renderScreen();

    await waitFor(() => getByText('On'));
  });
});
