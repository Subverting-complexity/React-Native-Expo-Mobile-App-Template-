import { StyleSheet, Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { AppPressable } from '../AppPressable';
import { a11y } from '@/theme';
import { renderWithTheme } from '@/test';

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('AppPressable', () => {
  it('renders children', async () => {
    const { getByText } = await renderWithTheme(
      <AppPressable accessibilityLabel="Save" accessibilityRole="button">
        <Text>Save</Text>
      </AppPressable>,
    );
    expect(getByText('Save')).toBeTruthy();
  });

  it('forwards onPress', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithTheme(
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

  it('ignores presses when only accessibilityState marks it disabled', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppPressable
        accessibilityLabel="Save"
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        onPress={onPress}
      >
        <Text>Save</Text>
      </AppPressable>,
    );
    fireEvent.press(getByLabelText('Save'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies the accessibility role, label, and hint', async () => {
    const { getByLabelText } = await renderWithTheme(
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

  it('enforces the minimum 44x44 touch target from the a11y token', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppPressable accessibilityLabel="Save" accessibilityRole="button">
        <Text>Save</Text>
      </AppPressable>,
    );
    const flat = StyleSheet.flatten(getByLabelText('Save').props.style);
    expect(flat.minWidth).toBe(a11y.minTouchTarget);
    expect(flat.minHeight).toBe(a11y.minTouchTarget);
  });

  it('does not fire onPress when disabled and reports disabled state', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithTheme(
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

  it('merges caller accessibilityState with the disabled mirror', async () => {
    const { getByLabelText } = await renderWithTheme(
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

  it('defaults disabled state to false when not disabled', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppPressable accessibilityLabel="Save" accessibilityRole="button">
        <Text>Save</Text>
      </AppPressable>,
    );
    expect(getByLabelText('Save').props.accessibilityState).toEqual({
      disabled: false,
    });
  });

  it('merges a caller style over the touch-target floor', async () => {
    const { getByLabelText } = await renderWithTheme(
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

  it('supports the function form of style', async () => {
    const styleFn = jest.fn(() => ({ opacity: 0.5 }));
    const { getByLabelText } = await renderWithTheme(
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

  it('supports function children', async () => {
    const { getByText } = await renderWithTheme(
      <AppPressable accessibilityLabel="Save" accessibilityRole="button">
        {({ pressed }) => <Text>{pressed ? 'Pressing' : 'Idle'}</Text>}
      </AppPressable>,
    );
    expect(getByText('Idle')).toBeTruthy();
  });
});
