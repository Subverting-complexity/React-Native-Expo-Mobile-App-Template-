import { StyleSheet, Text } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { AppCard } from '../AppCard';
import { a11y, radii, spacing, DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { renderWithTheme } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

describe('AppCard', () => {
  it('renders its children', async () => {
    const { getByText } = await renderWithTheme(
      <AppCard>
        <Text>Inside</Text>
      </AppCard>,
    );
    expect(getByText('Inside')).toBeTruthy();
  });

  it('is not interactive without onPress (no button role)', async () => {
    const { queryByRole } = await renderWithTheme(
      <AppCard>
        <Text>Static</Text>
      </AppCard>,
    );
    expect(queryByRole('button')).toBeNull();
  });

  it('applies the default radius and padding from tokens', async () => {
    const { getByTestId } = await renderWithTheme(
      <AppCard testID="card">
        <Text>Card</Text>
      </AppCard>,
    );
    const flat = StyleSheet.flatten(getByTestId('card').props.style);
    expect(flat.borderRadius).toBe(radii.lg);
    expect(flat.padding).toBe(spacing[4]);
  });

  it('respects a custom padding token', async () => {
    const { getByTestId } = await renderWithTheme(
      <AppCard padding={6} testID="card">
        <Text>Roomy</Text>
      </AppCard>,
    );
    const flat = StyleSheet.flatten(getByTestId('card').props.style);
    expect(flat.padding).toBe(spacing[6]);
  });

  it('elevated variant carries a platform shadow and no border', async () => {
    const { getByTestId } = await renderWithTheme(
      <AppCard variant="elevated" testID="card">
        <Text>Raised</Text>
      </AppCard>,
    );
    const flat = StyleSheet.flatten(getByTestId('card').props.style);
    const hasShadow =
      'shadowRadius' in flat || 'elevation' in flat || 'boxShadow' in flat;
    expect(hasShadow).toBe(true);
    expect(flat.borderWidth).toBeUndefined();
  });

  it('outlined variant carries a themed border', async () => {
    const { getByTestId } = await renderWithTheme(
      <AppCard variant="outlined" testID="card">
        <Text>Bordered</Text>
      </AppCard>,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByTestId('card').props.style);
      expect(flat.borderWidth).toBe(1);
      expect(flat.borderColor).toBe(lightColors.border);
    });
  });

  it('filled variant uses the surfaceVariant background', async () => {
    const { getByTestId } = await renderWithTheme(
      <AppCard variant="filled" testID="card">
        <Text>Filled</Text>
      </AppCard>,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByTestId('card').props.style);
      expect(flat.backgroundColor).toBe(lightColors.surfaceVariant);
    });
  });

  it('becomes a tappable button when onPress is provided', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppCard onPress={onPress} accessibilityLabel="Open details">
        <Text>Tap me</Text>
      </AppCard>,
    );
    const el = getByLabelText('Open details');
    expect(el.props.accessibilityRole).toBe('button');
    fireEvent.press(el);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('pressable card inherits the 44x44 touch floor', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppCard onPress={jest.fn()} accessibilityLabel="Open">
        <Text>Tap</Text>
      </AppCard>,
    );
    const flat = StyleSheet.flatten(getByLabelText('Open').props.style);
    expect(flat.minHeight).toBe(a11y.minTouchTarget);
  });
});
