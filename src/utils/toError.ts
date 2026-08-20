/**
 * Coerce an unknown thrown value into a real `Error`.
 *
 * Every caller of this function is a `catch` block — the one place where a
 * throw is NOT caught by the `try` above it — so it must never throw itself.
 * `String(err)` can throw for a null-prototype object or one whose
 * `toString` throws; both are handled here, falling back to a generic Error
 * rather than letting error handling become the error.
 */
export function toError(value: unknown): Error {
  if (value instanceof Error) return value;

  try {
    return new Error(typeof value === 'string' ? value : String(value));
  } catch {
    return new Error('a thrown value that cannot be described');
  }
}
