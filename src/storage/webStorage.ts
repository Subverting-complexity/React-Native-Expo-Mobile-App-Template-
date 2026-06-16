import type { StorageAdapter, WebStorageLike } from './types';

const PROBE_KEY = '@storage/__probe__';

/**
 * Resolve the browser's localStorage if it is present and usable. Some
 * environments expose the object but throw on access (private browsing with
 * storage disabled, blocked third-party cookies) or omit it entirely
 * (server-side rendering); a write/remove probe confirms it actually works.
 * Returns null when localStorage cannot be used, signalling the in-memory
 * fallback. Read through `globalThis` so this module needs no DOM type lib.
 */
function resolveLocalStorage(): WebStorageLike | null {
  try {
    const ls = (globalThis as { localStorage?: WebStorageLike }).localStorage;
    if (!ls) {
      return null;
    }
    ls.setItem(PROBE_KEY, '1');
    ls.removeItem(PROBE_KEY);
    return ls;
  } catch {
    return null;
  }
}

/**
 * Build a web preference store. Persists to the given backing store
 * (localStorage by default) and falls back to a process-lifetime in-memory map
 * when no usable backing store is available, so reads and writes keep working
 * for the session instead of throwing.
 *
 * The backing store is injectable to keep the adapter unit-testable and to let
 * callers supply a custom store; pass `null` to force the in-memory fallback.
 */
export function createWebStorage(
  backing: WebStorageLike | null = resolveLocalStorage(),
): StorageAdapter {
  if (backing) {
    return {
      getItem: async (key) => backing.getItem(key),
      setItem: async (key, value) => {
        backing.setItem(key, value);
      },
    };
  }

  const memory = new Map<string, string>();
  return {
    getItem: async (key) => memory.get(key) ?? null,
    setItem: async (key, value) => {
      memory.set(key, value);
    },
  };
}

/** Web (browser) preference storage backed by localStorage. */
export const webStorage: StorageAdapter = createWebStorage();
