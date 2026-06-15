import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { ToastProvider } from '../ToastProvider';
import { useToast } from '../useToast';
import { A11yContext, MAX_FONT_SIZE_MULTIPLIER } from '@/a11y';
import { ThemeProvider, lightColors, type StorageAdapter } from '@/theme';

function makeStorage(saved: string | null = null): StorageAdapter {
  return {
    getItem: jest.fn(async () => saved),
    setItem: jest.fn(async () => {}),
  };
}

function Harness({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider storage={makeStorage()}>
      <A11yContext.Provider
        value={{ reduceMotion: true, maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER }}
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
  it('shows nothing until show() is called', () => {
    const { queryByTestId } = render(
      <Harness>
        <Trigger />
      </Harness>,
    );
    expect(queryByTestId('toast')).toBeNull();
  });

  it('shows a toast with the given message', () => {
    const { getByTestId, getByText } = render(
      <Harness>
        <Trigger />
      </Harness>,
    );
    fireEvent.press(getByTestId('show-info'));
    expect(getByTestId('toast')).toBeTruthy();
    expect(getByText('First message')).toBeTruthy();
  });

  it('passes the tone through to the toast surface', () => {
    const { getByTestId } = render(
      <Harness>
        <Trigger />
      </Harness>,
    );
    fireEvent.press(getByTestId('show-success'));
    const surface = StyleSheet.flatten(getByTestId('toast').props.style);
    expect(surface.backgroundColor).toBe(lightColors.success);
  });

  it('replaces the current toast when show() is called again', () => {
    const { getByTestId, getByText, queryByText } = render(
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

  it('dismiss() removes the active toast', () => {
    const { getByTestId, queryByTestId } = render(
      <Harness>
        <Trigger />
      </Harness>,
    );
    fireEvent.press(getByTestId('show-info'));
    expect(queryByTestId('toast')).toBeTruthy();
    fireEvent.press(getByTestId('dismiss'));
    expect(queryByTestId('toast')).toBeNull();
  });

  it('dismisses the toast via its close button', () => {
    const { getByTestId, queryByTestId } = render(
      <Harness>
        <Trigger />
      </Harness>,
    );
    fireEvent.press(getByTestId('show-info'));
    fireEvent.press(getByTestId('toast-dismiss'));
    expect(queryByTestId('toast')).toBeNull();
  });
});
