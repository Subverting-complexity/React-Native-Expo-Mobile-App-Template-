import { readApiBaseUrl } from '../apiBaseUrl';

describe('readApiBaseUrl', () => {
  it('returns the URL that the build set', () => {
    expect(readApiBaseUrl({ apiBaseUrl: 'https://api.example.test' })).toBe(
      'https://api.example.test',
    );
  });

  it('removes trailing slashes and surrounding spaces', () => {
    expect(readApiBaseUrl({ apiBaseUrl: ' https://api.example.test// ' })).toBe(
      'https://api.example.test',
    );
  });

  it('keeps a path prefix', () => {
    expect(readApiBaseUrl({ apiBaseUrl: 'https://api.example.test/v1/' })).toBe(
      'https://api.example.test/v1',
    );
  });

  it.each([
    undefined,
    {},
    { apiBaseUrl: '' },
    { apiBaseUrl: '  ' },
    { apiBaseUrl: 42 },
  ])('throws a clear error when the value is missing (%p)', (extra) => {
    expect(() => readApiBaseUrl(extra)).toThrow(/is not set/);
  });

  it('accepts http:// in a development build, for a local backend', () => {
    expect(readApiBaseUrl({ apiBaseUrl: 'http://localhost:5000' }, true)).toBe(
      'http://localhost:5000',
    );
  });

  it('rejects http:// in a release build', () => {
    expect(() =>
      readApiBaseUrl({ apiBaseUrl: 'http://api.example.test' }, false),
    ).toThrow('API_BASE_URL must start with https://, but it is');
  });

  it.each(['api.example.test', 'ftp://api.example.test', 'https://', '/api'])(
    'throws a clear error when the value is not an http(s) URL (%p)',
    (apiBaseUrl) => {
      expect(() => readApiBaseUrl({ apiBaseUrl }, true)).toThrow(
        /must start with https:\/\/ or http:\/\//,
      );
    },
  );
});
