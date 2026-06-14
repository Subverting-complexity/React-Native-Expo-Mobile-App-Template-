import { Text, TextInput } from 'react-native';
import { render } from '@testing-library/react-native';

import {
  MAX_FONT_SIZE_MULTIPLIER,
  applyGlobalFontScaleCap,
} from '../maxFontScale';

describe('applyGlobalFontScaleCap', () => {
  beforeAll(() => {
    applyGlobalFontScaleCap();
    // Second call must be a no-op (idempotent), not a double application.
    applyGlobalFontScaleCap();
  });

  it('caps Text font scaling by default', () => {
    const { getByText } = render(<Text>hello</Text>);
    expect(getByText('hello').props.maxFontSizeMultiplier).toBe(
      MAX_FONT_SIZE_MULTIPLIER,
    );
  });

  it('lets a Text instance override the cap', () => {
    const { getByText } = render(<Text maxFontSizeMultiplier={4}>big</Text>);
    expect(getByText('big').props.maxFontSizeMultiplier).toBe(4);
  });

  it('caps TextInput font scaling by default', () => {
    const { getByTestId } = render(<TextInput testID="field" />);
    expect(getByTestId('field').props.maxFontSizeMultiplier).toBe(
      MAX_FONT_SIZE_MULTIPLIER,
    );
  });
});
