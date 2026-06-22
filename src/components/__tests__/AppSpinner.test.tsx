import { render } from '@testing-library/react-native';

import { AppSpinner } from '../AppSpinner';
import { ThemeProvider, lightColors, type StorageAdapter } from '@/theme';

function makeStorage(saved: string | null = null): StorageAdapter {
  return {
    getItem: jest.fn(async () => saved),
    setItem: jest.fn(async () => {}),
  };
}

function renderWithTheme(ui: React.ReactElement, saved: string | null = null) {
  return render(
    <ThemeProvider storage={makeStorage(saved)}>{ui}</ThemeProvider>,
  );
}

describe('AppSpinner', () => {
  it('exposes the progressbar role with a default loading label', () => {
    const { getByRole } = renderWithTheme(<AppSpinner testID="spinner" />);
    const el = getByRole('progressbar');
    expect(el.props.accessibilityLabel).toBe('Loading');
  });

  it('uses a custom accessibility label', () => {
    const { getByLabelText } = renderWithTheme(
      <AppSpinner accessibilityLabel="Fetching results" />,
    );
    expect(getByLabelText('Fetching results')).toBeTruthy();
  });

  it('hides from assistive tech when the label is null', () => {
    const { queryByRole, getByTestId } = renderWithTheme(
      <AppSpinner accessibilityLabel={null} testID="spinner" />,
    );
    expect(queryByRole('progressbar')).toBeNull();
    // The spinner is hidden from the a11y tree, so query it explicitly.
    const el = getByTestId('spinner', { includeHiddenElements: true });
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('resolves tone to a palette colour token', () => {
    const { getByTestId } = renderWithTheme(
      <AppSpinner tone="secondary" testID="spinner" />,
    );
    expect(getByTestId('spinner').props.color).toBe(lightColors.secondary);
  });

  it('maps semantic sizes to ActivityIndicator sizes', () => {
    const { getByTestId } = renderWithTheme(
      <AppSpinner size="sm" testID="spinner" />,
    );
    expect(getByTestId('spinner').props.size).toBe('small');
  });

  it('defaults to the large size', () => {
    const { getByTestId } = renderWithTheme(<AppSpinner testID="spinner" />);
    expect(getByTestId('spinner').props.size).toBe('large');
  });
});
