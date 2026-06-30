import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';

import { A11yProvider } from '../A11yProvider';
import { useA11y, useReduceMotion } from '../useA11y';
import { MAX_FONT_SIZE_MULTIPLIER } from '../maxFontScale';
import { mockReduceMotion } from '@/test';

function Consumer() {
  const { reduceMotion, maxFontSizeMultiplier } = useA11y();
  const selected = useReduceMotion();
  return (
    <>
      <Text testID="reduceMotion">{String(reduceMotion)}</Text>
      <Text testID="selector">{String(selected)}</Text>
      <Text testID="cap">{maxFontSizeMultiplier}</Text>
    </>
  );
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('A11yProvider', () => {
  it('exposes the reduce-motion preference from the OS', async () => {
    mockReduceMotion(true);
    const { getByTestId } = render(
      <A11yProvider>
        <Consumer />
      </A11yProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('reduceMotion').props.children).toBe('true'),
    );
    expect(getByTestId('selector').props.children).toBe('true');
  });

  it('exposes the global font-scale cap', () => {
    mockReduceMotion(false);
    const { getByTestId } = render(
      <A11yProvider>
        <Consumer />
      </A11yProvider>,
    );
    expect(getByTestId('cap').props.children).toBe(MAX_FONT_SIZE_MULTIPLIER);
  });
});

describe('useA11y', () => {
  it('throws when called outside A11yProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      'useA11y must be called inside <A11yProvider>',
    );
    spy.mockRestore();
  });
});
