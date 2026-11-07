import { useMemo, type ReactNode } from 'react';

import type { ApiClient } from './ApiClient';
import { ApiContext } from './ApiContext';
import { readApiBaseUrl } from './apiBaseUrl';
import { createHttpApiClient } from './httpApiClient';

interface ApiProviderProps {
  /** The data layer to provide. Defaults to the real HTTP client; demo mode and tests pass their own. */
  client?: ApiClient;
  children: ReactNode;
}

/**
 * Provides the app's {@link ApiClient} to every screen through {@link useApi}.
 * Mount this once near the app root.
 */
export function ApiProvider({ client, children }: ApiProviderProps) {
  const value = useMemo(
    () =>
      client ??
      createHttpApiClient({
        getBaseUrl: () => readApiBaseUrl(),
        fetch: (...args) => fetch(...args),
      }),
    [client],
  );
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}
