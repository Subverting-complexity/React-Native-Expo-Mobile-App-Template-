import { ScrollView, StyleSheet, Text } from 'react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';
import { render, waitFor } from '@testing-library/react-native';

import { AppScreenContainer } from '../AppScreenContainer';
import { ThemeProvider, lightColors, spacing, type StorageAdapter } from '@/theme';

const METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

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
    <SafeAreaProvider initialMetrics={METRICS}>
      <ThemeProvider storage={makeStorage(saved)}>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('AppScreenContainer', () => {
  it('renders its children', () => {
    const { getByText } = renderWithTheme(
      <AppScreenContainer>
        <Text>Screen body</Text>
      </AppScreenContainer>,
    );
    expect(getByText('Screen body')).toBeTruthy();
  });

  it('applies the themed background to the safe-area root', async () => {
    const { getByTestId } = renderWithTheme(
      <AppScreenContainer testID="screen">
        <Text>Body</Text>
      </AppScreenContainer>,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByTestId('screen').props.style);
      expect(flat.backgroundColor).toBe(lightColors.background);
    });
  });

  it('applies standard padding to the content when padded (default)', () => {
    const { getByTestId } = renderWithTheme(
      <AppScreenContainer testID="screen">
        <Text>Padded</Text>
      </AppScreenContainer>,
    );
    const flat = StyleSheet.flatten(getByTestId('screen-content').props.style);
    expect(flat.padding).toBe(spacing[4]);
  });

  it('omits padding when padded is false', () => {
    const { getByTestId } = renderWithTheme(
      <AppScreenContainer padded={false} testID="screen">
        <Text>Flush</Text>
      </AppScreenContainer>,
    );
    const flat = StyleSheet.flatten(getByTestId('screen-content').props.style);
    expect(flat.padding).toBeUndefined();
  });

  it('renders a ScrollView only when scroll is enabled', () => {
    const scrolling = renderWithTheme(
      <AppScreenContainer scroll>
        <Text>Scrolls</Text>
      </AppScreenContainer>,
    );
    expect(scrolling.UNSAFE_queryAllByType(ScrollView).length).toBeGreaterThan(0);

    const stat = renderWithTheme(
      <AppScreenContainer>
        <Text>Static</Text>
      </AppScreenContainer>,
    );
    expect(stat.UNSAFE_queryAllByType(ScrollView).length).toBe(0);
  });
});
