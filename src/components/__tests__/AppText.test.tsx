import { StyleSheet } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';

import { AppText } from '../AppText';
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
});
