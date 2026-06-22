import { StyleSheet } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';

import { AppBadge } from '../AppBadge';
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

describe('AppBadge', () => {
  it('renders its label', () => {
    const { getByText } = renderWithTheme(<AppBadge label="New" />);
    expect(getByText('New')).toBeTruthy();
  });

  it('fills the solid variant with the tone colour and readable foreground', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <AppBadge label="Active" tone="success" testID="badge" />,
      'light',
    );
    await waitFor(() => {
      expect(
        StyleSheet.flatten(getByTestId('badge').props.style).backgroundColor,
      ).toBe(lightColors.success);
      expect(StyleSheet.flatten(getByText('Active').props.style).color).toBe(
        lightColors.onSuccess,
      );
    });
  });

  it('renders the soft variant on a surface fill with the tone as foreground', async () => {
    const { getByText, getByTestId } = renderWithTheme(
      <AppBadge label="Beta" tone="info" variant="soft" testID="badge" />,
      'light',
    );
    await waitFor(() => {
      expect(
        StyleSheet.flatten(getByTestId('badge').props.style).backgroundColor,
      ).toBe(lightColors.surfaceVariant);
      expect(StyleSheet.flatten(getByText('Beta').props.style).color).toBe(
        lightColors.info,
      );
    });
  });

  it('renders the outline variant with a tone border and transparent fill', async () => {
    const { getByTestId } = renderWithTheme(
      <AppBadge
        label="Draft"
        tone="warning"
        variant="outline"
        testID="badge"
      />,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByTestId('badge').props.style);
      expect(flat.backgroundColor).toBe('transparent');
      expect(flat.borderWidth).toBe(1);
      expect(flat.borderColor).toBe(lightColors.warning);
    });
  });

  it('announces a custom accessibility label as a single node', () => {
    const { getByLabelText } = renderWithTheme(
      <AppBadge label="3" accessibilityLabel="3 unread messages" />,
    );
    const el = getByLabelText('3 unread messages');
    expect(el.props.accessible).toBe(true);
  });
});
