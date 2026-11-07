import { AccessibilityInfo, StyleSheet } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { AppToast } from '../AppToast';
import { DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { renderWithProviders } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

describe('AppToast', () => {
  it('renders the message with the alert role', async () => {
    const { getByRole, getByText } = await renderWithProviders(
      <AppToast message="Saved" onDismiss={jest.fn()} duration={0} />,
    );
    expect(getByRole('alert')).toBeTruthy();
    expect(getByText('Saved')).toBeTruthy();
  });

  it('announces the message to assistive tech on appear', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    await renderWithProviders(
      <AppToast message="Profile updated" onDismiss={jest.fn()} duration={0} />,
    );
    expect(announce).toHaveBeenCalledWith('Profile updated');
    announce.mockRestore();
  });

  it('dismisses when the close button is pressed', async () => {
    const onDismiss = jest.fn();
    const { getByTestId } = await renderWithProviders(
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

  it('renders an action button that fires its handler', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await renderWithProviders(
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

  it('does not merge into one element, so a screen reader can reach its buttons', async () => {
    const { getByTestId } = await renderWithProviders(
      <AppToast
        message="Item deleted"
        onDismiss={jest.fn()}
        duration={0}
        action={{ label: 'Undo', onPress: jest.fn() }}
        testID="toast"
      />,
    );
    expect(getByTestId('toast').props.accessible).not.toBe(true);
  });

  it('auto-dismisses after the given duration', async () => {
    jest.useFakeTimers();
    try {
      const onDismiss = jest.fn();
      await renderWithProviders(
        <AppToast message="Saved" onDismiss={onDismiss} duration={3000} />,
      );
      expect(onDismiss).not.toHaveBeenCalled();
      jest.advanceTimersByTime(3000);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('stays for 10 seconds by default when it has an action', async () => {
    jest.useFakeTimers();
    try {
      const onDismiss = jest.fn();
      await renderWithProviders(
        <AppToast
          message="Item deleted"
          onDismiss={onDismiss}
          action={{ label: 'Undo', onPress: jest.fn() }}
        />,
      );
      jest.advanceTimersByTime(9999);
      expect(onDismiss).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not auto-dismiss when duration is 0', async () => {
    jest.useFakeTimers();
    try {
      const onDismiss = jest.fn();
      await renderWithProviders(
        <AppToast message="Sticky" onDismiss={onDismiss} duration={0} />,
      );
      jest.advanceTimersByTime(60000);
      expect(onDismiss).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('resolves tone to palette background and foreground colours', async () => {
    const { getByTestId, getByText } = await renderWithProviders(
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
