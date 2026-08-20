import { toError } from './toError';

/**
 * The message a user should see for a caught error.
 *
 * Production shows only the caller's plain-language fallback — raw error
 * text leaks implementation detail, is often meaningless to the user
 * ("[object Object]", a stack frame, a native error code), and reads as a
 * bug in itself. Development appends the raw detail in parentheses so the
 * developer still sees the cause without opening a debugger.
 *
 * The dev flag is a parameter (defaulting to `__DEV__`) so both branches are
 * unit-testable.
 */
export function userFacingErrorMessage(
  error: unknown,
  fallback: string,
  isDev: boolean = __DEV__,
): string {
  if (!isDev) return fallback;

  const detail = toError(error).message.trim();
  return detail.length > 0 ? `${fallback} (${detail})` : fallback;
}
