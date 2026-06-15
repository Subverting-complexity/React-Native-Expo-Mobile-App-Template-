import { Dimensions, StyleSheet } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';

import { AppText } from '../AppText';
import { MAX_FONT_SIZE_MULTIPLIER } from '@/a11y';
import {
  ThemeProvider,
  lightColors,
  typography,
  FONT_FAMILIES,
  type StorageAdapter,
} from '@/theme';

function makeStorage(saved: string | null = null): StorageAdapter {
  return {
    getItem: jest.fn(async () => saved),
    setItem: jest.fn(async () => {}),
  };
}

// Default to no saved mode: ThemeProvider then performs no post-render state
// update, so synchronous assertions stay free of act(...) warnings. Pass
// 'light' (with waitFor) only when asserting colour tokens.
function renderWithTheme(ui: React.ReactElement, saved: string | null = null) {
  return render(
    <ThemeProvider storage={makeStorage(saved)}>{ui}</ThemeProvider>,
  );
}

function styleOf(node: { props: { style?: unknown } }) {
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
    dim === 'window' ? windowDims : { width: 360, height: 640, scale: 2, fontScale: 1 },
  );
});

afterAll(() => {
  dimsSpy.mockRestore();
});

describe('AppText', () => {
  it('renders its children', () => {
    const { getByText } = renderWithTheme(<AppText>Hello</AppText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('defaults to the body variant size from typography tokens', () => {
    const { getByText } = renderWithTheme(<AppText>Body</AppText>);
    const flat = styleOf(getByText('Body'));
    expect(flat.fontSize).toBe(typography.sizes.md.fontSize);
    expect(flat.lineHeight).toBe(typography.sizes.md.lineHeight);
    expect(flat.fontFamily).toBe(FONT_FAMILIES.sans);
  });

  it('resolves a heading variant to the bold family and larger size', () => {
    const { getByText } = renderWithTheme(<AppText variant="heading">Title</AppText>);
    const flat = styleOf(getByText('Title'));
    expect(flat.fontSize).toBe(typography.sizes['2xl'].fontSize);
    expect(flat.fontFamily).toBe(FONT_FAMILIES.sansBold);
    expect(flat.fontWeight).toBe('700');
  });

  it('maps tone to a palette colour token', async () => {
    const { getByText } = renderWithTheme(
      <AppText tone="secondary">Muted</AppText>,
      'light',
    );
    await waitFor(() => {
      expect(styleOf(getByText('Muted')).color).toBe(lightColors.textSecondary);
    });
  });

  it('maps the accent tone to the primary colour', async () => {
    const { getByText } = renderWithTheme(
      <AppText tone="accent">Link</AppText>,
      'light',
    );
    await waitFor(() => {
      expect(styleOf(getByText('Link')).color).toBe(lightColors.primary);
    });
  });

  it('merges a caller style last so overrides win', () => {
    const { getByText } = renderWithTheme(
      <AppText style={{ fontSize: 99, color: 'rebeccapurple' }}>X</AppText>,
    );
    const flat = styleOf(getByText('X'));
    expect(flat.fontSize).toBe(99);
    expect(flat.color).toBe('rebeccapurple');
  });

  it('passes through standard Text props', () => {
    const { getByText } = renderWithTheme(
      <AppText numberOfLines={2}>Long</AppText>,
    );
    expect(getByText('Long').props.numberOfLines).toBe(2);
  });

  describe('Dynamic Type scaling', () => {
    const base = typography.sizes.md.lineHeight;

    it('scales lineHeight with the OS font scale up to the cap', () => {
      setFontScale(1.3);
      const { getByText } = renderWithTheme(<AppText>Body</AppText>);
      expect(styleOf(getByText('Body')).lineHeight).toBeCloseTo(base * 1.3);
    });

    it('clamps lineHeight scaling at the default cap', () => {
      setFontScale(3);
      const { getByText } = renderWithTheme(<AppText>Body</AppText>);
      expect(styleOf(getByText('Body')).lineHeight).toBeCloseTo(
        base * MAX_FONT_SIZE_MULTIPLIER,
      );
    });

    it('applies the default cap to the underlying Text node', () => {
      const { getByText } = renderWithTheme(<AppText>Body</AppText>);
      expect(getByText('Body').props.maxFontSizeMultiplier).toBe(
        MAX_FONT_SIZE_MULTIPLIER,
      );
    });

    it('honors a per-instance maxFontSizeMultiplier override', () => {
      setFontScale(3);
      const { getByText } = renderWithTheme(
        <AppText maxFontSizeMultiplier={2}>Body</AppText>,
      );
      const node = getByText('Body');
      expect(styleOf(node).lineHeight).toBeCloseTo(base * 2);
      expect(node.props.maxFontSizeMultiplier).toBe(2);
    });

    it('opts out of the cap when maxFontSizeMultiplier is null', () => {
      setFontScale(3);
      const { getByText } = renderWithTheme(
        <AppText maxFontSizeMultiplier={null}>Body</AppText>,
      );
      const node = getByText('Body');
      expect(styleOf(node).lineHeight).toBeCloseTo(base * 3);
      expect(node.props.maxFontSizeMultiplier).toBeNull();
    });

    it('freezes scaling when allowFontScaling is false', () => {
      setFontScale(3);
      const { getByText } = renderWithTheme(
        <AppText allowFontScaling={false}>Body</AppText>,
      );
      const node = getByText('Body');
      expect(styleOf(node).lineHeight).toBe(base);
      expect(node.props.allowFontScaling).toBe(false);
    });
  });
});
