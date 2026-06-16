/**
 * Minimal async key-value contract for persisting user preferences.
 *
 * This is the single source of truth for the storage port: every platform
 * implementation conforms to it, and consumers (e.g. ThemeProvider) depend on
 * this interface rather than a concrete backend. Keep the surface to the two
 * operations preferences need — adding more would ripple into every injected
 * test double that implements this shape.
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

/**
 * The synchronous slice of the Web Storage API the web adapter relies on.
 * Declared structurally so the storage module does not depend on the DOM type
 * library; the browser's `localStorage` and a test double both satisfy it.
 */
export interface WebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
