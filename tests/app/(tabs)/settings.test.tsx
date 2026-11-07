import { AccessibilityInfo } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';

import SettingsScreen from '../../../app/(tabs)/settings';
import { A11yProvider } from '@/a11y';
import { ThemeProvider } from '@/theme';
import { makeStorage, renderHydrated } from '../../../src/test';

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderScreen(storage = makeStorage()) {
  return renderHydrated(<SettingsScreen />, {
    wrapper: ({ children }) => (
      <SafeAreaProvider initialMetrics={METRICS}>
        <ThemeProvider storage={storage}>
          <A11yProvider>{children}</A11yProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    ),
  });
}

// Restore the spied-on announcement method after every test.
afterEach(() => {
  jest.restoreAllMocks();
});

describe('SettingsScreen', () => {
  it('offers the three colour-mode options in a labelled radio group', async () => {
    const { getByRole, getByTestId } = await renderScreen();
    expect(getByTestId('theme-mode-group').props).toMatchObject({
      accessibilityRole: 'radiogroup',
      accessibilityLabel: 'Appearance',
    });
    getByRole('radio', { name: 'Light' });
    getByRole('radio', { name: 'Dark' });
    getByRole('radio', { name: 'System' });
  });

  it('marks the active mode (System) as checked by default', async () => {
    const { getByRole } = await renderScreen(makeStorage(null));
    const system = getByRole('radio', { name: 'System' });
    expect(system.props.accessibilityState.checked).toBe(true);
  });

  it('persists and announces the chosen mode (reflects live)', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    const storage = makeStorage(null);
    const { getByRole } = await renderScreen(storage);

    fireEvent.press(getByRole('radio', { name: 'Dark' }));

    // Persisted through the theme provider's storage seam...
    expect(storage.setItem).toHaveBeenCalledWith('@theme/colorMode', 'dark');
    // ...reflected live: the chosen chip is now the checked one...
    expect(
      getByRole('radio', { name: 'Dark' }).props.accessibilityState.checked,
    ).toBe(true);
    // ...and announced for screen-reader users.
    expect(announce).toHaveBeenCalledWith('Appearance set to Dark');
  });

  it('keeps the current mode when the active chip is re-tapped', async () => {
    const storage = makeStorage(null);
    const { getByRole } = await renderScreen(storage);

    // System is selected by default; re-tapping it would clear a normal
    // single-select group, but a colour mode must always be set, so the tap is
    // a no-op — the mode is unchanged and nothing is written to storage.
    fireEvent.press(getByRole('radio', { name: 'System' }));

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(
      getByRole('radio', { name: 'System' }).props.accessibilityState.checked,
    ).toBe(true);
  });

  it('adopts a persisted mode on load', async () => {
    const { getByRole } = await renderScreen(makeStorage('light'));
    await waitFor(() =>
      expect(
        getByRole('radio', { name: 'Light' }).props.accessibilityState.checked,
      ).toBe(true),
    );
  });

  it('offers both themes, with Standard checked by default', async () => {
    const { getByRole, getByTestId } = await renderScreen(makeStorage(null));
    expect(getByTestId('theme-group').props).toMatchObject({
      accessibilityRole: 'radiogroup',
      accessibilityLabel: 'Theme',
    });
    getByRole('radio', { name: 'High contrast' });
    expect(
      getByRole('radio', { name: 'Standard' }).props.accessibilityState.checked,
    ).toBe(true);
  });

  it('persists and announces the chosen theme', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    const storage = makeStorage(null);
    const { getByRole } = await renderScreen(storage);

    fireEvent.press(getByRole('radio', { name: 'High contrast' }));

    expect(storage.setItem).toHaveBeenCalledWith('@theme/name', 'highContrast');
    expect(
      getByRole('radio', { name: 'High contrast' }).props.accessibilityState
        .checked,
    ).toBe(true);
    expect(announce).toHaveBeenCalledWith('Theme set to High contrast');
  });

  it('keeps the current theme when the active chip is re-tapped', async () => {
    const storage = makeStorage(null);
    const { getByRole } = await renderScreen(storage);

    fireEvent.press(getByRole('radio', { name: 'Standard' }));

    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('shows the Appearance, Theme, Text size and Motion sections', async () => {
    const { getByText } = await renderScreen();
    for (const title of ['Appearance', 'Theme', 'Text size', 'Motion']) {
      getByText(title);
    }
  });

  it('shows the font-scale sample with the central cap', async () => {
    const { getByText, getByTestId } = await renderScreen();
    getByText(/Current scale:/);
    getByTestId('font-scale-sample');
  });

  it('shows reduce motion as off by default', async () => {
    const { getByTestId, getByText } = await renderScreen();
    getByTestId('reduce-motion-indicator');
    getByText('Off');
  });

  it('shows reduce motion as on when the OS preference is on', async () => {
    jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    jest
      .spyOn(AccessibilityInfo, 'addEventListener')
      .mockReturnValue({ remove: jest.fn() } as unknown as ReturnType<
        typeof AccessibilityInfo.addEventListener
      >);

    const { getByText } = await renderScreen();

    await waitFor(() => getByText('On'));
  });
});
