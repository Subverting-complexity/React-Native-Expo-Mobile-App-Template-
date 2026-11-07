import { AppSpinner } from '../AppSpinner';
import { DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { renderWithTheme } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

describe('AppSpinner', () => {
  it('exposes the progressbar role with a default loading label', async () => {
    const { getByRole } = await renderWithTheme(
      <AppSpinner testID="spinner" />,
    );
    const el = getByRole('progressbar');
    expect(el.props.accessibilityLabel).toBe('Loading');
  });

  it('uses a custom accessibility label', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppSpinner accessibilityLabel="Fetching results" />,
    );
    expect(getByLabelText('Fetching results')).toBeTruthy();
  });

  it('hides from assistive tech when the label is null', async () => {
    const { queryByRole, getByTestId } = await renderWithTheme(
      <AppSpinner accessibilityLabel={null} testID="spinner" />,
    );
    expect(queryByRole('progressbar')).toBeNull();
    // The spinner is hidden from the a11y tree, so query it explicitly.
    const el = getByTestId('spinner', { includeHiddenElements: true });
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('resolves tone to a palette colour token', async () => {
    const { getByTestId } = await renderWithTheme(
      <AppSpinner tone="secondary" testID="spinner" />,
    );
    expect(getByTestId('spinner').props.color).toBe(lightColors.secondary);
  });

  it('maps semantic sizes to ActivityIndicator sizes', async () => {
    const { getByTestId } = await renderWithTheme(
      <AppSpinner size="sm" testID="spinner" />,
    );
    expect(getByTestId('spinner').props.size).toBe('small');
  });

  it('defaults to the large size', async () => {
    const { getByTestId } = await renderWithTheme(
      <AppSpinner testID="spinner" />,
    );
    expect(getByTestId('spinner').props.size).toBe('large');
  });
});
