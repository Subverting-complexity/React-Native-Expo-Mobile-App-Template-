import { useContext } from 'react';

import type { ApiClient } from './ApiClient';
import { ApiContext } from './ApiContext';

/** The app's data layer. Must be called inside {@link ApiProvider}. */
export function useApi(): ApiClient {
  const ctx = useContext(ApiContext);
  if (ctx === null) {
    throw new Error('useApi must be called inside <ApiProvider>');
  }
  return ctx;
}
