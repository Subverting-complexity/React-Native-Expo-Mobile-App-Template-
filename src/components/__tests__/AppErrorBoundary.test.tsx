import { Dimensions, StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { AppErrorBoundary, DefaultErrorFallback } from '../AppErrorBoundary';
import { MAX_FONT_SIZE_MULTIPLIER } from '@/a11y';
import { ThemeProvider, typography } from '@/theme';
import { makeStorage } from '@/test';

/** Child that throws on render; `throwError` toggles recovery for reset tests. */
function Boom({ message = 'kaboom' }: { message?: string }) {
  if (throwError) {
    throw new Error(message);
  }
  return <Text>recovered</Text>;
}

let throwError = true;

describe('AppErrorBoundary', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    throwError = true;
    // React logs caught render errors to console.error; silence the noise so
    // test output stays readable without hiding genuine failures.
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders its children when nothing throws', () => {
    throwError = false;
    const { getByText } = render(
      <ThemeProvider storage={makeStorage()}>
        <AppErrorBoundary>
          <Text>healthy</Text>
        </AppErrorBoundary>
      </ThemeProvider>,
    );
    expect(getByText('healthy')).toBeTruthy();
  });

  it('catches a thrown error and renders the fallback', () => {
    const { getByTestId, getByText } = render(
      <ThemeProvider storage={makeStorage()}>
        <AppErrorBoundary>
          <Boom message="explode" />
        </AppErrorBoundary>
      </ThemeProvider>,
    );
    expect(getByTestId('app-error-boundary-fallback')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText(/explode/)).toBeTruthy();
  });

  it('renders the fallback safely outside a ThemeProvider', () => {
    const { getByTestId, getByText } = render(
      <AppErrorBoundary>
        <Boom />
      </AppErrorBoundary>,
    );
    // No provider mounted: the fallback must still render, not throw a second
    // error from useTheme.
    expect(getByTestId('app-error-boundary-fallback')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('reset clears the error and re-renders children', () => {
    const { getByLabelText, getByText, queryByTestId } = render(
      <ThemeProvider storage={makeStorage()}>
        <AppErrorBoundary>
          <Boom />
        </AppErrorBoundary>
      </ThemeProvider>,
    );
    // The next render should succeed once the underlying condition is fixed.
    throwError = false;
    fireEvent.press(getByLabelText('Try again'));
    expect(getByText('recovered')).toBeTruthy();
    expect(queryByTestId('app-error-boundary-fallback')).toBeNull();
  });

  it('calls onError with the error and component stack', () => {
    const onError = jest.fn();
    render(
      <ThemeProvider storage={makeStorage()}>
        <AppErrorBoundary onError={onError}>
          <Boom message="reported" />
        </AppErrorBoundary>
      </ThemeProvider>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    const [error, info] = onError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('reported');
    expect(typeof info.componentStack).toBe('string');
  });

  it('renders a custom fallback render-prop with the error and reset', () => {
    const { getByText, getByLabelText } = render(
      <ThemeProvider storage={makeStorage()}>
        <AppErrorBoundary
          fallback={({ error, reset }) => (
            <Text accessibilityLabel="custom-reset" onPress={reset}>
              custom: {error.message}
            </Text>
          )}
        >
          <Boom message="custom-error" />
        </AppErrorBoundary>
      </ThemeProvider>,
    );
    expect(getByText('custom: custom-error')).toBeTruthy();
    // reset is wired through to the boundary: once the child stops throwing,
    // pressing it recovers the subtree.
    throwError = false;
    fireEvent.press(getByLabelText('custom-reset'));
    expect(getByText('recovered')).toBeTruthy();
  });

  it('DefaultErrorFallback renders standalone and reset fires', () => {
    const reset = jest.fn();
    const { getByText, getByLabelText } = render(
      <DefaultErrorFallback error={new Error('standalone')} reset={reset} />,
    );
    expect(getByText(/standalone/)).toBeTruthy();
    fireEvent.press(getByLabelText('Try again'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  describe('DefaultErrorFallback font scaling', () => {
    // useWindowDimensions reads Dimensions.get('window'). The object must be
    // stable, or the hook's change effect fires on every call.
    const dims = { width: 360, height: 640, scale: 2, fontScale: 3 };
    let dimsSpy: jest.SpyInstance;

    beforeEach(() => {
      dimsSpy = jest.spyOn(Dimensions, 'get').mockReturnValue(dims);
    });

    afterEach(() => {
      dimsSpy.mockRestore();
    });

    it('caps the font scale on every text, because it cannot use AppText', () => {
      const { getByText } = render(
        <DefaultErrorFallback error={new Error('x')} reset={jest.fn()} />,
      );
      for (const text of ['Something went wrong', 'Try again']) {
        expect(getByText(text).props.maxFontSizeMultiplier).toBe(
          MAX_FONT_SIZE_MULTIPLIER,
        );
      }
    });

    it('scales the line height by the capped font scale, so large text does not clip', () => {
      const { getByText } = render(
        <DefaultErrorFallback error={new Error('x')} reset={jest.fn()} />,
      );
      const heading = typography.sizes[typography.variants.heading.size];
      expect(
        StyleSheet.flatten(getByText('Something went wrong').props.style)
          .lineHeight,
      ).toBe(heading.lineHeight * MAX_FONT_SIZE_MULTIPLIER);
    });
  });
});
