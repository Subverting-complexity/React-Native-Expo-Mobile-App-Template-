import { userFacingErrorMessage } from '../userFacingError';

describe('userFacingErrorMessage', () => {
  it('shows only the fallback in production', () => {
    expect(
      userFacingErrorMessage(
        new Error('ECONNREFUSED 127.0.0.1'),
        'Could not save.',
        false,
      ),
    ).toBe('Could not save.');
  });

  it('appends the raw detail in development', () => {
    expect(
      userFacingErrorMessage(new Error('disk full'), 'Could not save.', true),
    ).toBe('Could not save. (disk full)');
  });

  it('handles a detail-free error without dangling parentheses', () => {
    expect(
      userFacingErrorMessage(new Error('  '), 'Could not save.', true),
    ).toBe('Could not save.');
  });

  it('copes with non-Error throwables', () => {
    expect(userFacingErrorMessage('boom', 'Could not save.', true)).toBe(
      'Could not save. (boom)',
    );
  });
});
