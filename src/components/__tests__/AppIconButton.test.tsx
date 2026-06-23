import { StyleSheet } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { AppIconButton } from '../AppIconButton';
import { AppText } from '../AppText';
import { a11y, lightColors, typography } from '@/theme';
import { renderWithTheme } from '@/test';

const icon = <AppText>★</AppText>;

describe('AppIconButton', () => {
  it('requires and exposes an accessibility label and button role', () => {
    const { getByLabelText } = renderWithTheme(
      <AppIconButton
        icon={icon}
        accessibilityLabel="Favourite"
        onPress={jest.fn()}
      />,
    );
    expect(getByLabelText('Favourite').props.accessibilityRole).toBe('button');
  });

  it('fires onPress when enabled', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppIconButton icon={icon} accessibilityLabel="Add" onPress={onPress} />,
    );
    fireEvent.press(getByLabelText('Add'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled and reports disabled state', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppIconButton
        icon={icon}
        accessibilityLabel="Add"
        onPress={onPress}
        disabled
      />,
    );
    const el = getByLabelText('Add');
    fireEvent.press(el);
    expect(onPress).not.toHaveBeenCalled();
    expect(el.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it('hides the icon, blocks presses, and reports busy when loading', () => {
    const onPress = jest.fn();
    const { queryByText, getByLabelText } = renderWithTheme(
      <AppIconButton
        icon={icon}
        accessibilityLabel="Add"
        onPress={onPress}
        loading
      />,
    );
    expect(queryByText('★')).toBeNull();
    const el = getByLabelText('Add');
    fireEvent.press(el);
    expect(onPress).not.toHaveBeenCalled();
    expect(el.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true, busy: true }),
    );
  });

  it('inherits the 44x44 minimum touch target from AppPressable', () => {
    const { getByLabelText } = renderWithTheme(
      <AppIconButton
        icon={icon}
        accessibilityLabel="Add"
        onPress={jest.fn()}
      />,
    );
    const flat = StyleSheet.flatten(getByLabelText('Add').props.style);
    expect(flat.minWidth).toBe(a11y.minTouchTarget);
    expect(flat.minHeight).toBe(a11y.minTouchTarget);
  });

  it('passes the resolved colour and token-derived size to an icon function', async () => {
    const { getByText } = renderWithTheme(
      <AppIconButton
        accessibilityLabel="Add"
        onPress={jest.fn()}
        icon={({ size }) => <AppText>{`size:${size}`}</AppText>}
      />,
      'light',
    );
    // md size derives its glyph size from the `2xl` typography token.
    await waitFor(() => {
      expect(
        getByText(`size:${typography.sizes['2xl'].fontSize}`),
      ).toBeTruthy();
    });
  });

  it('applies the primary variant background from theme tokens', async () => {
    const { getByLabelText } = renderWithTheme(
      <AppIconButton
        icon={icon}
        accessibilityLabel="Add"
        onPress={jest.fn()}
      />,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByLabelText('Add').props.style);
      expect(flat.backgroundColor).toBe(lightColors.primary);
    });
  });

  it('renders as a circle when round is set', async () => {
    const { getByLabelText } = renderWithTheme(
      <AppIconButton
        icon={icon}
        accessibilityLabel="Add"
        onPress={jest.fn()}
        round
      />,
      'light',
    );
    await waitFor(() => {
      const flat = StyleSheet.flatten(getByLabelText('Add').props.style);
      expect(flat.borderRadius).toBe(9999);
    });
  });
});
