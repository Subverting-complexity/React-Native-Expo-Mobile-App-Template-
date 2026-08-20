import { toError } from '../toError';

describe('toError', () => {
  it('returns an Error unchanged', () => {
    const original = new Error('boom');
    expect(toError(original)).toBe(original);
  });

  it('wraps a string', () => {
    expect(toError('boom').message).toBe('boom');
  });

  it('describes plain values', () => {
    expect(toError(42).message).toBe('42');
    expect(toError(undefined).message).toBe('undefined');
  });

  it('never throws, even for values String() cannot describe', () => {
    // A null-prototype object has no toString; String(value) throws. This
    // function only ever runs inside catch blocks, where a throw would not
    // be caught by the try above it.
    const indescribable = Object.create(null);
    expect(toError(indescribable).message).toBe(
      'a thrown value that cannot be described',
    );

    const hostile = {
      toString() {
        throw new Error('nope');
      },
    };
    expect(toError(hostile).message).toBe(
      'a thrown value that cannot be described',
    );
  });
});
