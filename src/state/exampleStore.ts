import { create, type StoreApi, type UseBoundStore } from 'zustand';

import { storage as platformStorage, type StorageAdapter } from '@/storage';

export type { StorageAdapter };

export interface ExampleStoreDeps {
  storage: StorageAdapter;
}

export type ExampleStatus = 'idle' | 'loading' | 'ready';

export interface ExampleState {
  /** The persisted domain value this example store manages. */
  count: number;
  /** Lifecycle of the persisted value: before/while/after hydration. */
  status: ExampleStatus;
  /** Synchronous action — increase the count by one. */
  increment: () => void;
  /** Synchronous action — return the count to zero. */
  reset: () => void;
  /** Async side effect — load the persisted count through `deps.storage`. */
  hydrate: () => Promise<void>;
  /** Async side effect — write the current count through `deps.storage`. */
  persist: () => Promise<void>;
}

/** Storage key under which the example store persists its value. */
export const EXAMPLE_STORAGE_KEY = '@example/count';

const defaultDeps: ExampleStoreDeps = { storage: platformStorage };

/**
 * Build an example Zustand store wired to the given dependencies. Domain
 * stores in a project built from this template should follow this shape:
 * a factory taking optional `deps` so the same store is trivially testable
 * with mocks. Each call returns an independent store, so tests never share
 * state.
 */
export function createExampleStore(
  deps: ExampleStoreDeps = defaultDeps,
): UseBoundStore<StoreApi<ExampleState>> {
  return create<ExampleState>((set, get) => ({
    count: 0,
    status: 'idle',
    increment: () => set((state) => ({ count: state.count + 1 })),
    reset: () => set({ count: 0 }),
    hydrate: async () => {
      set({ status: 'loading' });
      const saved = await deps.storage.getItem(EXAMPLE_STORAGE_KEY);
      const parsed = saved === null ? 0 : Number.parseInt(saved, 10);
      set({ count: Number.isNaN(parsed) ? 0 : parsed, status: 'ready' });
    },
    persist: async () => {
      await deps.storage.setItem(EXAMPLE_STORAGE_KEY, String(get().count));
    },
  }));
}

/**
 * The default, app-wide example store, wired with the platform-aware storage
 * adapter. Components import this hook; tests use `createExampleStore` with
 * injected mocks instead.
 */
export const useExampleStore = createExampleStore();
