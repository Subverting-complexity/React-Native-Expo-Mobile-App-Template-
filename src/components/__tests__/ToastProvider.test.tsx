import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { ToastProvider } from '../ToastProvider';
import { useToast } from '../useToast';
import { A11yContext, MAX_FONT_SIZE_MULTIPLIER } from '@/a11y';
import { ThemeProvider, DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { makeStorage, renderHydrated } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

function Harness({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider storage={makeStorage()}>
      <A11yContext.Provider
        value={{
          reduceMotion: true,
          maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
        }}
      >
        <ToastProvider>{children}</ToastProvider>
      </A11yContext.Provider>
    </ThemeProvider>
  );
}

// A consumer that drives the imperative toast API via tappable controls.
function Trigger() {
  const { show, dismiss } = useToast();
  return (
    <>
      <Text testID="show-info" onPress={() => show('First message')}>
        show-info
      </Text>
      <Text
        testID="show-success"
        onPress={() => show('Saved', { tone: 'success' })}
      >
        show-success
      </Text>
      <Text testID="show-second" onPress={() => show('Second message')}>
        show-second
      </Text>
      <Text testID="dismiss" onPress={() => dismiss()}>
        dismiss
      </Text>
    </>
  );
}

describe('useToast', () => {
  it('throws when called outside a ToastProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger />)).toThrow(
      'useToast must be called inside <ToastProvider>',
    );
    spy.mockRestore();
  });
});

describe('ToastProvider', () => {
  it('shows nothing until show() is called', async () => {
    const { queryByTestId } = await renderHydrated(
      <Harness>
        <Trigger />
      </Harness>,
    );
    expect(queryByTestId('toast')).toBeNull();
  });

  it('shows a toast with the given message', async () => {
    const { getByTestId, getByText } = await renderHydrated(
      <Harness>
        <Trigger />
      </Harness>,
    );
    fireEvent.press(getByTestId('show-info'));
    expect(getByTestId('toast')).toBeTruthy();
    expect(getByText('First message')).toBeTruthy();
  });

  it('passes the tone through to the toast surface', async () => {
    const { getByTestId } = await renderHydrated(
      <Harness>
        <Trigger />
      </Harness>,
    );
    fireEvent.press(getByTestId('show-success'));
    const surface = StyleSheet.flatten(getByTestId('toast').props.style);
    expect(surface.backgroundColor).toBe(lightColors.success);
  });

  it('replaces the current toast when show() is called again', async () => {
    const { getByTestId, getByText, queryByText } = await renderHydrated(
      <Harness>
        <Trigger />
      </Harness>,
    );
    fireEvent.press(getByTestId('show-info'));
    expect(getByText('First message')).toBeTruthy();
    fireEvent.press(getByTestId('show-second'));
    expect(queryByText('First message')).toBeNull();
    expect(getByText('Second message')).toBeTruthy();
  });

  it('dismiss() removes the active toast', async () => {
    const { getByTestId, queryByTestId } = await renderHydrated(
      <Harness>
        <Trigger />
      </Harness>,
    );
    fireEvent.press(getByTestId('show-info'));
    expect(queryByTestId('toast')).toBeTruthy();
    fireEvent.press(getByTestId('dismiss'));
    expect(queryByTestId('toast')).toBeNull();
  });

  it('dismisses the toast via its close button', async () => {
    const { getByTestId, queryByTestId } = await renderHydrated(
      <Harness>
        <Trigger />
      </Harness>,
    );
    fireEvent.press(getByTestId('show-info'));
    fireEvent.press(getByTestId('toast-dismiss'));
    expect(queryByTestId('toast')).toBeNull();
  });

  it('sits above the bottom safe area and the bottom offset', async () => {
    const insets = { top: 0, right: 0, bottom: 34, left: 0 };
    const { getByTestId } = await renderHydrated(
      <ThemeProvider storage={makeStorage()}>
        <A11yContext.Provider
          value={{
            reduceMotion: true,
            maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
          }}
        >
          <SafeAreaInsetsContext.Provider value={insets}>
            <ToastProvider bottomOffset={64}>
              <Trigger />
            </ToastProvider>
          </SafeAreaInsetsContext.Provider>
        </A11yContext.Provider>
      </ThemeProvider>,
    );
    fireEvent.press(getByTestId('show-info'));
    const overlay = StyleSheet.flatten(
      getByTestId('toast-overlay').props.style,
    );
    expect(overlay.bottom).toBe(
      34 + 64 + THEMES[DEFAULT_THEME_NAME].light.spacing[4],
    );
  });
});
