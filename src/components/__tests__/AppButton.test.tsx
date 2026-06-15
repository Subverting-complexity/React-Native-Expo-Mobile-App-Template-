import { StyleSheet } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AppButton } from '../AppButton';
import { ThemeProvider, a11y, lightColors, type StorageAdapter } from '@/theme';

function makeStorage(saved: string | null = null): StorageAdapter {
  return {
    getItem: jest.fn(async () => saved),
    setItem: jest.fn(async () => {}),
  };
}

// Default to no saved mode so synchronous assertions stay free of act(...)
// warnings; pass 'light' (with waitFor) only when asserting colour tokens.
function renderWithTheme(ui: React.ReactElement, saved: string | null = null) {
  return render(
    <ThemeProvider storage={makeStorage(saved)}>{ui}</ThemeProvider>,
  );
}

describe('AppButton', () => {
  it('renders its label', () => {
    const { getByText } = renderWithTheme(<AppButton label="Save" onPress={jest.fn()} />);
    expect(getByText('Save')).toBeTruthy();
  });

  it('uses the label as the default accessibility name and button role', () => {
    const { getByLabelText } = renderWithTheme(
      <AppButton label="Save" onPress={jest.fn()} />,
    );
    expect(getByLabelText('Save').props.accessibilityRole).toBe('button');
  });

  it('allows overriding the accessibility label', () => {
    const { getByLabelText } = renderWithTheme(
      <AppButton label="Save" accessibilityLabel="Save document" onPress={jest.fn()} />,
    );
    expect(getByLabelText('Save document')).toBeTruthy();
  });

  it('fires onPress when enabled', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(<AppButton label="Go" onPress={onPress} />);
    fireEvent.press(getByLabelText('Go'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled and reports disabled state', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppButton label="Go" onPress={onPress} disabled />,
    );
    const el = getByLabelText('Go');
    fireEvent.press(el);
    expect(onPress).not.toHaveBeenCalled();
    expect(el.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('shows a spinner, hides the label, and reports busy when loading', () => {
    const onPress = jest.fn();
    const { queryByText, getByLabelText } = renderWithTheme(
      <AppButton label="Submit" onPress={onPress} loading />,
    );
    expect(queryByText('Submit')).toBeNull();
    const el = getByLabelText('Submit');
    fireEvent.press(el);
    expect(onPress).not.toHaveBeenCalled();
    expect(el.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true, busy: true }),
    );
  });

  it('inherits the 44x44 minimum touch target from AppPressable', () => {
    const { getByLabelText } = renderWithTheme(<AppButton label="Tap" onPress={jest.fn()} />);
    const flat = StyleSheet.flatten(getByLabelText('Tap').props.style);
    expect(flat.minWidth).toBe(a11y.minTouchTarget);
    expect(flat.minHeight).toBe(a11y.minTouchTarget);
  });

  it('applies the primary variant background from theme tokens', async () => {
    const { getByLabelText } = renderWithTheme(
      <AppButton label="Primary" onPress={jest.fn()} />,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByLabelText('Primary').props.style);
      expect(flat.backgroundColor).toBe(lightColors.primary);
    });
  });

  it('renders the outline variant with a border and transparent fill', async () => {
    const { getByLabelText } = renderWithTheme(
      <AppButton label="Outline" variant="outline" onPress={jest.fn()} />,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByLabelText('Outline').props.style);
      expect(flat.backgroundColor).toBe('transparent');
      expect(flat.borderWidth).toBe(1);
      expect(flat.borderColor).toBe(lightColors.primary);
    });
  });
});
