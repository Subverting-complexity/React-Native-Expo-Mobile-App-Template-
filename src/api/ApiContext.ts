import { createContext } from 'react';

import type { ApiClient } from './ApiClient';

export const ApiContext = createContext<ApiClient | null>(null);
