import { StyleSheet } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { AppBackButton } from '../AppBackButton';
import { AppText } from '../AppText';
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

describe('AppBackButton', () => {
  it('defaults to a "Go back" button with the arrow glyph', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <AppBackButton onPress={jest.fn()} />,
    );
    const el = getByLabelText('Go back');
    expect(el.props.accessibilityRole).toBe('button');
    expect(getByText('←')).toBeTruthy();
  });

  it('renders an optional visible label', () => {
    const { getByText } = renderWithTheme(
      <AppBackButton label="Settings" onPress={jest.fn()} />,
    );
    expect(getByText('Settings')).toBeTruthy();
  });

  it('allows overriding the accessibility label', () => {
    const { getByLabelText } = renderWithTheme(
      <AppBackButton accessibilityLabel="Back to inbox" onPress={jest.fn()} />,
    );
    expect(getByLabelText('Back to inbox')).toBeTruthy();
  });

  it('fires onPress when enabled', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppBackButton onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Go back'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled and reports disabled state', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppBackButton onPress={onPress} disabled />,
    );
    const el = getByLabelText('Go back');
    fireEvent.press(el);
    expect(onPress).not.toHaveBeenCalled();
    expect(el.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('replaces the default glyph with a custom icon', () => {
    const { getByText, queryByText } = renderWithTheme(
      <AppBackButton onPress={jest.fn()} icon={<AppText>chevron</AppText>} />,
    );
    expect(getByText('chevron')).toBeTruthy();
    expect(queryByText('←')).toBeNull();
  });

  it('tints the default glyph with the accent colour from tokens', async () => {
    const { getByText } = renderWithTheme(
      <AppBackButton onPress={jest.fn()} />,
      'light',
    );
    await waitFor(() => {
      expect(StyleSheet.flatten(getByText('←').props.style).color).toBe(
        lightColors.primary,
      );
    });
  });
});
