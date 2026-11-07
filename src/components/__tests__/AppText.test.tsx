import {
  Dimensions,
  StyleSheet,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { waitFor } from '@testing-library/react-native';

import { AppText } from '../AppText';
import { MAX_FONT_SIZE_MULTIPLIER } from '@/a11y';
import { typography, FONT_FAMILIES, DEFAULT_THEME_NAME, THEMES } from '@/theme';
import { renderWithTheme } from '@/test';

const lightColors = THEMES[DEFAULT_THEME_NAME].light.colors;

function styleOf(node: { props: { style?: StyleProp<TextStyle> } }) {
  return StyleSheet.flatten(node.props.style);
}

// `useWindowDimensions` reads its initial value from `Dimensions.get('window')`,
// so spying there lets us drive the OS font scale. The mock returns a *stable*
// object per scale — a fresh reference each call would make the hook's
// change-effect fire forever. Default to 1 so the suite matches an unscaled OS.
let windowDims = { width: 360, height: 640, scale: 2, fontScale: 1 };
const dimsSpy = jest.spyOn(Dimensions, 'get');

function setFontScale(fontScale: number) {
  windowDims = { width: 360, height: 640, scale: 2, fontScale };
}

beforeEach(() => {
  setFontScale(1);
  dimsSpy.mockImplementation((dim) =>
    dim === 'window'
      ? windowDims
      : { width: 360, height: 640, scale: 2, fontScale: 1 },
  );
});

afterAll(() => {
  dimsSpy.mockRestore();
});

describe('AppText', () => {
  it('renders its children', async () => {
    const { getByText } = await renderWithTheme(<AppText>Hello</AppText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('defaults to the body variant size from typography tokens', async () => {
    const { getByText } = await renderWithTheme(<AppText>Body</AppText>);
    const flat = styleOf(getByText('Body'));
    expect(flat.fontSize).toBe(typography.sizes.md.fontSize);
    expect(flat.lineHeight).toBe(typography.sizes.md.lineHeight);
    expect(flat.fontFamily).toBe(FONT_FAMILIES.sans);
  });

  it('resolves a heading variant to the bold family and larger size', async () => {
    const { getByText } = await renderWithTheme(
      <AppText variant="heading">Title</AppText>,
    );
    const flat = styleOf(getByText('Title'));
    expect(flat.fontSize).toBe(typography.sizes['2xl'].fontSize);
    expect(flat.fontFamily).toBe(FONT_FAMILIES.sansBold);
    expect(flat.fontWeight).toBe('700');
  });

  it('maps tone to a palette colour token', async () => {
    const { getByText } = await renderWithTheme(
      <AppText tone="secondary">Muted</AppText>,
      'light',
    );
    await waitFor(() => {
      expect(styleOf(getByText('Muted')).color).toBe(lightColors.textSecondary);
    });
  });

  it('maps the accent tone to the primary colour', async () => {
    const { getByText } = await renderWithTheme(
      <AppText tone="accent">Link</AppText>,
      'light',
    );
    await waitFor(() => {
      expect(styleOf(getByText('Link')).color).toBe(lightColors.primary);
    });
  });

  it('merges a caller style last so overrides win', async () => {
    const { getByText } = await renderWithTheme(
      <AppText style={{ fontSize: 99, color: 'rebeccapurple' }}>X</AppText>,
    );
    const flat = styleOf(getByText('X'));
    expect(flat.fontSize).toBe(99);
    expect(flat.color).toBe('rebeccapurple');
  });

  it('passes through standard Text props', async () => {
    const { getByText } = await renderWithTheme(
      <AppText numberOfLines={2}>Long</AppText>,
    );
    expect(getByText('Long').props.numberOfLines).toBe(2);
  });

  describe('Dynamic Type scaling', () => {
    const base = typography.sizes.md.lineHeight;

    it('scales lineHeight with the OS font scale up to the cap', async () => {
      setFontScale(1.3);
      const { getByText } = await renderWithTheme(<AppText>Body</AppText>);
      expect(styleOf(getByText('Body')).lineHeight).toBeCloseTo(base * 1.3);
    });

    it('clamps lineHeight scaling at the default cap', async () => {
      setFontScale(3);
      const { getByText } = await renderWithTheme(<AppText>Body</AppText>);
      expect(styleOf(getByText('Body')).lineHeight).toBeCloseTo(
        base * MAX_FONT_SIZE_MULTIPLIER,
      );
    });

    it('applies the default cap to the underlying Text node', async () => {
      const { getByText } = await renderWithTheme(<AppText>Body</AppText>);
      expect(getByText('Body').props.maxFontSizeMultiplier).toBe(
        MAX_FONT_SIZE_MULTIPLIER,
      );
    });

    it('honors a per-instance maxFontSizeMultiplier override', async () => {
      setFontScale(3);
      const { getByText } = await renderWithTheme(
        <AppText maxFontSizeMultiplier={2}>Body</AppText>,
      );
      const node = getByText('Body');
      expect(styleOf(node).lineHeight).toBeCloseTo(base * 2);
      expect(node.props.maxFontSizeMultiplier).toBe(2);
    });

    it('opts out of the cap when maxFontSizeMultiplier is null', async () => {
      setFontScale(3);
      const { getByText } = await renderWithTheme(
        <AppText maxFontSizeMultiplier={null}>Body</AppText>,
      );
      const node = getByText('Body');
      expect(styleOf(node).lineHeight).toBeCloseTo(base * 3);
      expect(node.props.maxFontSizeMultiplier).toBeNull();
    });

    it('scales the lineHeight of a size override, and keeps the variant font', async () => {
      setFontScale(1.3);
      const { getByText } = await renderWithTheme(
        <AppText variant="label" size="lg">
          Label
        </AppText>,
      );
      const flat = styleOf(getByText('Label'));
      expect(flat.fontSize).toBe(typography.sizes.lg.fontSize);
      expect(flat.lineHeight).toBeCloseTo(typography.sizes.lg.lineHeight * 1.3);
      expect(flat.fontFamily).toBe(FONT_FAMILIES.sansBold);
    });

    it('freezes scaling when allowFontScaling is false', async () => {
      setFontScale(3);
      const { getByText } = await renderWithTheme(
        <AppText allowFontScaling={false}>Body</AppText>,
      );
      const node = getByText('Body');
      expect(styleOf(node).lineHeight).toBe(base);
      expect(node.props.allowFontScaling).toBe(false);
    });
  });
});
