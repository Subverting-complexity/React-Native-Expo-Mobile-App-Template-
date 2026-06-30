import { StyleSheet } from 'react-native';

import { AppLoadingScreen } from '../AppLoadingScreen';
import { lightColors } from '@/theme';
import { renderWithTheme } from '@/test';

describe('AppLoadingScreen', () => {
  it('announces a default loading label via a single progressbar element', () => {
    const { getByRole } = renderWithTheme(<AppLoadingScreen />);
    expect(getByRole('progressbar').props.accessibilityLabel).toBe('Loading');
  });

  it('uses the message as the announced label and shows it visibly', () => {
    const { getByRole, getByText } = renderWithTheme(
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

  it('hides the inner spinner from assistive tech to avoid double announcement', () => {
    // Exactly one progressbar element is exposed (the screen root), not the
    // nested spinner.
    const { getAllByRole } = renderWithTheme(
      <AppLoadingScreen message="Working" />,
    );
    expect(getAllByRole('progressbar')).toHaveLength(1);
  });

  it('paints the themed background', () => {
    const { getByTestId } = renderWithTheme(
      <AppLoadingScreen testID="loading" />,
    );
    const flat = StyleSheet.flatten(getByTestId('loading').props.style);
    expect(flat.backgroundColor).toBe(lightColors.background);
  });
});
