import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { AppListItem } from '../AppListItem';
import { ThemeProvider, a11y, type StorageAdapter } from '@/theme';

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

describe('AppListItem', () => {
  it('renders the title and subtitle', () => {
    const { getByText } = renderWithTheme(
      <AppListItem title="Profile" subtitle="Name, photo, bio" />,
    );
    expect(getByText('Profile')).toBeTruthy();
    expect(getByText('Name, photo, bio')).toBeTruthy();
  });

  it('is not interactive without onPress (no button role)', () => {
    const { queryByRole } = renderWithTheme(<AppListItem title="Static" />);
    expect(queryByRole('button')).toBeNull();
  });

  it('renders leading and trailing slots', () => {
    const { getByText } = renderWithTheme(
      <AppListItem
        title="Notifications"
        leading={<Text>L</Text>}
        trailing={<Text>R</Text>}
      />,
    );
    expect(getByText('L')).toBeTruthy();
    expect(getByText('R')).toBeTruthy();
  });

  it('becomes a tappable button when onPress is provided', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <AppListItem title="Open settings" onPress={onPress} />,
    );
    const el = getByLabelText('Open settings');
    expect(el.props.accessibilityRole).toBe('button');
    fireEvent.press(el);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('defaults the accessibility label to the title but allows an override', () => {
    const { getByLabelText } = renderWithTheme(
      <AppListItem
        title="Settings"
        onPress={jest.fn()}
        accessibilityLabel="Open app settings"
      />,
    );
    expect(getByLabelText('Open app settings')).toBeTruthy();
  });

  it('pressable row inherits the 44x44 touch floor', () => {
    const { getByLabelText } = renderWithTheme(
      <AppListItem title="Tap" onPress={jest.fn()} />,
    );
    const flat = StyleSheet.flatten(getByLabelText('Tap').props.style);
    expect(flat.minHeight).toBe(a11y.minTouchTarget);
  });

  it('reflects the disabled state on the pressable row', () => {
    const { getByLabelText } = renderWithTheme(
      <AppListItem title="Locked" onPress={jest.fn()} disabled />,
    );
    expect(getByLabelText('Locked').props.accessibilityState.disabled).toBe(
      true,
    );
  });
});
