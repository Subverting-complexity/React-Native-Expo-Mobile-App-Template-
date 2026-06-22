import { StyleSheet, Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AppCard } from '../AppCard';
import {
  ThemeProvider,
  a11y,
  lightColors,
  radii,
  spacing,
  type StorageAdapter,
} from '@/theme';

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

describe('AppCard', () => {
  it('renders its children', () => {
    const { getByText } = renderWithTheme(
      <AppCard>
        <Text>Inside</Text>
      </AppCard>,
    );
    expect(getByText('Inside')).toBeTruthy();
  });

  it('is not interactive without onPress (no button role)', () => {
    const { queryByRole } = renderWithTheme(
      <AppCard>
        <Text>Static</Text>
      </AppCard>,
    );
    expect(queryByRole('button')).toBeNull();
  });

  it('applies the default radius and padding from tokens', () => {
    const { getByTestId } = renderWithTheme(
      <AppCard testID="card">
        <Text>Card</Text>
      </AppCard>,
    );
    const flat = StyleSheet.flatten(getByTestId('card').props.style);
    expect(flat.borderRadius).toBe(radii.lg);
    expect(flat.padding).toBe(spacing[4]);
  });

  it('respects a custom padding token', () => {
    const { getByTestId } = renderWithTheme(
      <AppCard padding={6} testID="card">
        <Text>Roomy</Text>
      </AppCard>,
    );
    const flat = StyleSheet.flatten(getByTestId('card').props.style);
    expect(flat.padding).toBe(spacing[6]);
  });

  it('elevated variant carries a platform shadow and no border', () => {
    const { getByTestId } = renderWithTheme(
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
    const { getByTestId } = renderWithTheme(
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
    const { getByTestId } = renderWithTheme(
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

  it('becomes a tappable button when onPress is provided', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppCard onPress={onPress} accessibilityLabel="Open details">
        <Text>Tap me</Text>
      </AppCard>,
    );
    const el = getByLabelText('Open details');
    expect(el.props.accessibilityRole).toBe('button');
    fireEvent.press(el);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('pressable card inherits the 44x44 touch floor', () => {
    const { getByLabelText } = renderWithTheme(
      <AppCard onPress={jest.fn()} accessibilityLabel="Open">
        <Text>Tap</Text>
      </AppCard>,
    );
    const flat = StyleSheet.flatten(getByLabelText('Open').props.style);
    expect(flat.minHeight).toBe(a11y.minTouchTarget);
  });
});
