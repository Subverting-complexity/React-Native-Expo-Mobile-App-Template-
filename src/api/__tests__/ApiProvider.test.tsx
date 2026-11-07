import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { ApiClient } from '../ApiClient';
import { ApiProvider } from '../ApiProvider';
import { useApi } from '../useApi';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { apiBaseUrl: 'https://api.example.test/' } },
  },
}));

describe('ApiProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('provides the client it is given, so demo mode can swap the data layer', () => {
    const client: ApiClient = { get: jest.fn(), post: jest.fn() };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ApiProvider client={client}>{children}</ApiProvider>
    );

    const { result } = renderHook(() => useApi(), { wrapper });
    expect(result.current).toBe(client);
  });

  it('provides the HTTP client on the build base URL when no client is given', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"ok":true}'),
    } as Response);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ApiProvider>{children}</ApiProvider>
    );

    const { result } = renderHook(() => useApi(), { wrapper });

    await expect(result.current.get('/v1/ping')).resolves.toEqual({
      ok: true,
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/v1/ping',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('throws when useApi is called outside the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useApi())).toThrow(
      'useApi must be called inside <ApiProvider>',
    );
  });
});
