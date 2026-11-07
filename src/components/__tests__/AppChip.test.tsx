import { StyleSheet } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { AppChip } from '../AppChip';
import { DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { renderWithTheme } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

describe('AppChip', () => {
  it('renders its label with the button role', async () => {
    const { getByText, getByLabelText } = await renderWithTheme(
      <AppChip label="All" onPress={jest.fn()} />,
    );
    expect(getByText('All')).toBeTruthy();
    expect(getByLabelText('All').props.accessibilityRole).toBe('button');
  });

  it('reports the selected state to assistive tech', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppChip label="Active" selected onPress={jest.fn()} />,
    );
    expect(getByLabelText('Active').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it('reports a radio chip as checked rather than selected', async () => {
    const { getByRole } = await renderWithTheme(
      <AppChip
        label="Active"
        accessibilityRole="radio"
        selected
        onPress={jest.fn()}
      />,
    );
    expect(
      getByRole('radio', { name: 'Active' }).props.accessibilityState,
    ).toEqual({ checked: true, disabled: false });
  });

  it('fires onPress when enabled', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppChip label="Filter" onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Filter'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled and reports disabled state', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppChip label="Filter" onPress={onPress} disabled />,
    );
    const el = getByLabelText('Filter');
    fireEvent.press(el);
    expect(onPress).not.toHaveBeenCalled();
    expect(el.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('fills with the primary token when selected', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppChip label="On" selected onPress={jest.fn()} />,
      'light',
    );
    await waitFor(() => {
      expect(
        StyleSheet.flatten(getByLabelText('On').props.style).backgroundColor,
      ).toBe(lightColors.primary);
    });
  });

  it('uses a bordered surface fill when not selected', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppChip label="Off" onPress={jest.fn()} />,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByLabelText('Off').props.style);
      expect(flat.backgroundColor).toBe(lightColors.surfaceVariant);
      expect(flat.borderColor).toBe(lightColors.border);
    });
  });
});
