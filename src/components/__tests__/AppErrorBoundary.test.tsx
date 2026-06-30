import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { AppErrorBoundary, DefaultErrorFallback } from '../AppErrorBoundary';
import { ThemeProvider } from '@/theme';
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
    expect(getByText('explode')).toBeTruthy();
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
    expect(getByText('standalone')).toBeTruthy();
    fireEvent.press(getByLabelText('Try again'));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
