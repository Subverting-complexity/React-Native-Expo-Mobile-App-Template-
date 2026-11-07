import { StyleSheet } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { AppLinkButton } from '../AppLinkButton';
import { ThemeProvider, DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { makeStorage, renderWithTheme } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

describe('AppLinkButton', () => {
  it('renders its label with the link role', async () => {
    const { getByText, getByLabelText } = await renderWithTheme(
      <AppLinkButton label="Learn more" onPress={jest.fn()} />,
    );
    expect(getByText('Learn more')).toBeTruthy();
    expect(getByLabelText('Learn more').props.accessibilityRole).toBe('link');
  });

  it('allows overriding the accessibility label', async () => {
    const { getByLabelText } = await renderWithTheme(
      <AppLinkButton
        label="Learn more"
        accessibilityLabel="Learn more about pricing"
        onPress={jest.fn()}
      />,
    );
    expect(getByLabelText('Learn more about pricing')).toBeTruthy();
  });

  it('fires onPress when enabled', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppLinkButton label="Open" onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Open'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled and reports disabled state', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithTheme(
      <AppLinkButton label="Open" onPress={onPress} disabled />,
    );
    const el = getByLabelText('Open');
    fireEvent.press(el);
    expect(onPress).not.toHaveBeenCalled();
    expect(el.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('underlines the label only when underline is set', async () => {
    const { getByText, rerender } = await renderWithTheme(
      <AppLinkButton label="Plain" onPress={jest.fn()} />,
    );
    expect(
      StyleSheet.flatten(getByText('Plain').props.style).textDecorationLine,
    ).not.toBe('underline');
    rerender(
      <ThemeProvider storage={makeStorage()}>
        <AppLinkButton label="Plain" onPress={jest.fn()} underline />
      </ThemeProvider>,
    );
    expect(
      StyleSheet.flatten(getByText('Plain').props.style).textDecorationLine,
    ).toBe('underline');
  });

  it('uses the accent (primary) colour by default', async () => {
    const { getByText } = await renderWithTheme(
      <AppLinkButton label="Tinted" onPress={jest.fn()} />,
      'light',
    );
    await waitFor(() => {
      expect(StyleSheet.flatten(getByText('Tinted').props.style).color).toBe(
        lightColors.primary,
      );
    });
  });
});
