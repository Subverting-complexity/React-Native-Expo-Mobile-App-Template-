import { AccessibilityInfo, StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { AppToast } from '../AppToast';
import { A11yContext, MAX_FONT_SIZE_MULTIPLIER } from '@/a11y';
import { ThemeProvider, lightColors, type StorageAdapter } from '@/theme';

function makeStorage(saved: string | null = null): StorageAdapter {
  return {
    getItem: jest.fn(async () => saved),
    setItem: jest.fn(async () => {}),
  };
}

function renderWithProviders(
  ui: React.ReactElement,
  { reduceMotion = true }: { reduceMotion?: boolean } = {},
) {
  return render(
    <ThemeProvider storage={makeStorage()}>
      <A11yContext.Provider
        value={{
          reduceMotion,
          maxFontSizeMultiplier: MAX_FONT_SIZE_MULTIPLIER,
        }}
      >
        {ui}
      </A11yContext.Provider>
    </ThemeProvider>,
  );
}

describe('AppToast', () => {
  it('renders the message with the alert role', () => {
    const { getByRole, getByText } = renderWithProviders(
      <AppToast message="Saved" onDismiss={jest.fn()} duration={0} />,
    );
    expect(getByRole('alert')).toBeTruthy();
    expect(getByText('Saved')).toBeTruthy();
  });

  it('announces the message to assistive tech on appear', () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    renderWithProviders(
      <AppToast message="Profile updated" onDismiss={jest.fn()} duration={0} />,
    );
    expect(announce).toHaveBeenCalledWith('Profile updated');
    announce.mockRestore();
  });

  it('dismisses when the close button is pressed', () => {
    const onDismiss = jest.fn();
    const { getByTestId } = renderWithProviders(
      <AppToast
        message="Saved"
        onDismiss={onDismiss}
        duration={0}
        testID="toast"
      />,
    );
    fireEvent.press(getByTestId('toast-dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders an action button that fires its handler', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderWithProviders(
      <AppToast
        message="Item deleted"
        onDismiss={jest.fn()}
        duration={0}
        action={{ label: 'Undo', onPress }}
        testID="toast"
      />,
    );
    fireEvent.press(getByTestId('toast-action'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after the given duration', () => {
    jest.useFakeTimers();
    try {
      const onDismiss = jest.fn();
      renderWithProviders(
        <AppToast message="Saved" onDismiss={onDismiss} duration={3000} />,
      );
      expect(onDismiss).not.toHaveBeenCalled();
      jest.advanceTimersByTime(3000);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not auto-dismiss when duration is 0', () => {
    jest.useFakeTimers();
    try {
      const onDismiss = jest.fn();
      renderWithProviders(
        <AppToast message="Sticky" onDismiss={onDismiss} duration={0} />,
      );
      jest.advanceTimersByTime(60000);
      expect(onDismiss).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('resolves tone to palette background and foreground colours', () => {
    const { getByTestId, getByText } = renderWithProviders(
      <AppToast
        message="Done"
        tone="success"
        onDismiss={jest.fn()}
        duration={0}
        testID="toast"
      />,
    );
    const surface = StyleSheet.flatten(getByTestId('toast').props.style);
    expect(surface.backgroundColor).toBe(lightColors.success);
    const label = StyleSheet.flatten(getByText('Done').props.style);
    expect(label.color).toBe(lightColors.onSuccess);
  });
});
