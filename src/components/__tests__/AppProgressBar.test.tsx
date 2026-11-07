import { StyleSheet } from 'react-native';

import { AppProgressBar } from '../AppProgressBar';
import { spacing, DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { renderWithProviders } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

describe('AppProgressBar', () => {
  it('exposes the progressbar role with a percentage accessibility value', async () => {
    const { getByRole } = await renderWithProviders(
      <AppProgressBar value={0.42} accessibilityLabel="Upload progress" />,
    );
    const el = getByRole('progressbar');
    expect(el.props.accessibilityLabel).toBe('Upload progress');
    expect(el.props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 42,
    });
  });

  it('clamps values below 0 to 0%', async () => {
    const { getByRole } = await renderWithProviders(
      <AppProgressBar value={-1} accessibilityLabel="Progress" />,
    );
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(0);
  });

  it('clamps values above 1 to 100%', async () => {
    const { getByRole } = await renderWithProviders(
      <AppProgressBar value={5} accessibilityLabel="Progress" />,
    );
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(100);
  });

  it('treats NaN as 0%', async () => {
    const { getByRole } = await renderWithProviders(
      <AppProgressBar value={NaN} accessibilityLabel="Progress" />,
    );
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(0);
  });

  it('resolves tone to a palette colour on the fill', async () => {
    const { getByTestId } = await renderWithProviders(
      <AppProgressBar
        value={0.5}
        tone="success"
        accessibilityLabel="Progress"
        testID="bar"
      />,
    );
    const fill = StyleSheet.flatten(getByTestId('bar-fill').props.style);
    expect(fill.backgroundColor).toBe(lightColors.success);
  });

  it('defaults the track height to spacing token 2', async () => {
    const { getByTestId } = await renderWithProviders(
      <AppProgressBar value={0.5} accessibilityLabel="Progress" testID="bar" />,
    );
    const flat = StyleSheet.flatten(getByTestId('bar').props.style);
    expect(flat.height).toBe(spacing[2]);
  });

  it('honours a custom track height', async () => {
    const { getByTestId } = await renderWithProviders(
      <AppProgressBar
        value={0.5}
        height={20}
        accessibilityLabel="Progress"
        testID="bar"
      />,
    );
    const flat = StyleSheet.flatten(getByTestId('bar').props.style);
    expect(flat.height).toBe(20);
  });
});
