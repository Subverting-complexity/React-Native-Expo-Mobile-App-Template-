import { StyleSheet } from 'react-native';
import { waitFor } from '@testing-library/react-native';

import { AppBadge } from '../AppBadge';
import { DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { renderWithTheme } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

describe('AppBadge', () => {
  it('renders its label', async () => {
    const { getByText } = await renderWithTheme(<AppBadge label="New" />);
    expect(getByText('New')).toBeTruthy();
  });

  it('fills the solid variant with the tone colour and readable foreground', async () => {
    const { getByText, getByTestId } = await renderWithTheme(
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
    const { getByText, getByTestId } = await renderWithTheme(
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
    const { getByTestId } = await renderWithTheme(
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

  it('announces a custom accessibility label as a single node', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppBadge label="3" accessibilityLabel="3 unread messages" />,
    );
    const el = getByLabelText('3 unread messages');
    expect(el.props.accessible).toBe(true);
  });
});
