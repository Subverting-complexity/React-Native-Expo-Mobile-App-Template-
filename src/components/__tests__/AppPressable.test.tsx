import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { AppPressable } from '../AppPressable';
import { ThemeProvider, a11y, type StorageAdapter } from '@/theme';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function makeStorage(): StorageAdapter {
  return {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
  };
}

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider storage={makeStorage()}>{ui}</ThemeProvider>);
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('AppPressable', () => {
  it('renders children', () => {
    const { getByText } = renderWithTheme(
      <AppPressable accessibilityLabel="Save" accessibilityRole="button">
        <Text>Save</Text>
      </AppPressable>,
    );
    expect(getByText('Save')).toBeTruthy();
  });

  it('forwards onPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppPressable
        accessibilityLabel="Save"
        accessibilityRole="button"
        onPress={onPress}
      >
        <Text>Save</Text>
      </AppPressable>,
    );
    fireEvent.press(getByLabelText('Save'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies the accessibility role, label, and hint', () => {
    const { getByLabelText } = renderWithTheme(
      <AppPressable
        accessibilityLabel="Save"
        accessibilityRole="button"
        accessibilityHint="Saves your changes"
      >
        <Text>Save</Text>
      </AppPressable>,
    );
    const el = getByLabelText('Save');
    expect(el.props.accessibilityRole).toBe('button');
    expect(el.props.accessibilityHint).toBe('Saves your changes');
  });

  it('enforces the minimum 44x44 touch target from the a11y token', () => {
    const { getByLabelText } = renderWithTheme(
      <AppPressable accessibilityLabel="Save" accessibilityRole="button">
        <Text>Save</Text>
      </AppPressable>,
    );
    const flat = StyleSheet.flatten(getByLabelText('Save').props.style);
    expect(flat.minWidth).toBe(a11y.minTouchTarget);
    expect(flat.minHeight).toBe(a11y.minTouchTarget);
  });

  it('does not fire onPress when disabled and reports disabled state', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppPressable
        accessibilityLabel="Save"
        accessibilityRole="button"
        onPress={onPress}
        disabled
      >
        <Text>Save</Text>
      </AppPressable>,
    );
    const el = getByLabelText('Save');
    fireEvent.press(el);
    expect(onPress).not.toHaveBeenCalled();
    expect(el.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('merges caller accessibilityState with the disabled mirror', () => {
    const { getByLabelText } = renderWithTheme(
      <AppPressable
        accessibilityLabel="Toggle"
        accessibilityRole="switch"
        accessibilityState={{ selected: true }}
        disabled
      >
        <Text>Toggle</Text>
      </AppPressable>,
    );
    expect(getByLabelText('Toggle').props.accessibilityState).toEqual({
      selected: true,
      disabled: true,
    });
  });

  it('defaults disabled state to false when not disabled', () => {
    const { getByLabelText } = renderWithTheme(
      <AppPressable accessibilityLabel="Save" accessibilityRole="button">
        <Text>Save</Text>
      </AppPressable>,
    );
    expect(getByLabelText('Save').props.accessibilityState).toEqual({
      disabled: false,
    });
  });

  it('merges a caller style over the touch-target floor', () => {
    const { getByLabelText } = renderWithTheme(
      <AppPressable
        accessibilityLabel="Save"
        accessibilityRole="button"
        style={{ backgroundColor: 'rebeccapurple' }}
      >
        <Text>Save</Text>
      </AppPressable>,
    );
    const flat = StyleSheet.flatten(getByLabelText('Save').props.style);
    expect(flat.minWidth).toBe(a11y.minTouchTarget);
    expect(flat.backgroundColor).toBe('rebeccapurple');
  });

  it('supports the function form of style', () => {
    const styleFn = jest.fn(() => ({ opacity: 0.5 }));
    const { getByLabelText } = renderWithTheme(
      <AppPressable
        accessibilityLabel="Save"
        accessibilityRole="button"
        style={styleFn}
      >
        <Text>Save</Text>
      </AppPressable>,
    );
    const flat = StyleSheet.flatten(getByLabelText('Save').props.style);
    expect(styleFn).toHaveBeenCalled();
    expect(flat.opacity).toBe(0.5);
    expect(flat.minHeight).toBe(a11y.minTouchTarget);
  });

  it('supports function children', () => {
    const { getByText } = renderWithTheme(
      <AppPressable accessibilityLabel="Save" accessibilityRole="button">
        {({ pressed }) => <Text>{pressed ? 'Pressing' : 'Idle'}</Text>}
      </AppPressable>,
    );
    expect(getByText('Idle')).toBeTruthy();
  });
});
