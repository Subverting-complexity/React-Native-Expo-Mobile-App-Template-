import { StyleSheet } from 'react-native';

import { AppLoadingScreen } from '../AppLoadingScreen';
import { DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { renderWithTheme } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

describe('AppLoadingScreen', () => {
  it('announces a default loading label via a single progressbar element', async () => {
    const { getByRole } = await renderWithTheme(<AppLoadingScreen />);
    expect(getByRole('progressbar').props.accessibilityLabel).toBe('Loading');
  });

  it('uses the message as the announced label and shows it visibly', async () => {
    const { getByRole, getByText } = await renderWithTheme(
      <AppLoadingScreen message="Loading your data" />,
    );
    expect(getByRole('progressbar').props.accessibilityLabel).toBe(
      'Loading your data',
    );
    // The message is shown visually but hidden from the a11y tree (the root
    // announces it), so query it including hidden elements.
    expect(
      getByText('Loading your data', { includeHiddenElements: true }),
    ).toBeTruthy();
  });

  it('hides the inner spinner from assistive tech to avoid double announcement', async () => {
    // Exactly one progressbar element is exposed (the screen root), not the
    // nested spinner.
    const { getAllByRole } = await renderWithTheme(
      <AppLoadingScreen message="Working" />,
    );
    expect(getAllByRole('progressbar')).toHaveLength(1);
  });

  it('paints the themed background', async () => {
    const { getByTestId } = await renderWithTheme(
      <AppLoadingScreen testID="loading" />,
    );
    const flat = StyleSheet.flatten(getByTestId('loading').props.style);
    expect(flat.backgroundColor).toBe(lightColors.background);
  });
});
