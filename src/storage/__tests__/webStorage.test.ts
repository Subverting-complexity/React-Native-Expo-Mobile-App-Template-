import { createWebStorage } from '../webStorage';
import type { WebStorageLike } from '../types';

/** Map-backed double for the synchronous Web Storage surface. */
function fakeBacking(): WebStorageLike {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}

describe('createWebStorage (with a backing store)', () => {
  it('round-trips a written value through the backing store', async () => {
    const storage = createWebStorage(fakeBacking());
    await storage.setItem('color', 'blue');
    await expect(storage.getItem('color')).resolves.toBe('blue');
  });

  it('returns null for an unknown key', async () => {
    const storage = createWebStorage(fakeBacking());
    await expect(storage.getItem('missing')).resolves.toBeNull();
  });

  it('overwrites an existing value', async () => {
    const storage = createWebStorage(fakeBacking());
    await storage.setItem('color', 'blue');
    await storage.setItem('color', 'green');
    await expect(storage.getItem('color')).resolves.toBe('green');
  });

  it('writes to the injected backing store, not a private copy', async () => {
    const backing = fakeBacking();
    const storage = createWebStorage(backing);
    await storage.setItem('color', 'blue');
    expect(backing.getItem('color')).toBe('blue');
  });
});

describe('createWebStorage (in-memory fallback)', () => {
  it('round-trips a value when no backing store is available', async () => {
    const storage = createWebStorage(null);
    await storage.setItem('color', 'blue');
    await expect(storage.getItem('color')).resolves.toBe('blue');
  });

  it('returns null for an unknown key', async () => {
    const storage = createWebStorage(null);
    await expect(storage.getItem('missing')).resolves.toBeNull();
  });

  it('keeps separate instances isolated', async () => {
    const a = createWebStorage(null);
    const b = createWebStorage(null);
    await a.setItem('color', 'blue');
    await expect(b.getItem('color')).resolves.toBeNull();
  });
});

describe('createWebStorage (default backing resolution)', () => {
  it('resolves a usable adapter and round-trips a value', async () => {
    const storage = createWebStorage();
    await storage.setItem('@web/default-roundtrip', 'ok');
    await expect(storage.getItem('@web/default-roundtrip')).resolves.toBe('ok');
  });
});

describe('createWebStorage (localStorage probe)', () => {
  const globalRef = globalThis as { localStorage?: WebStorageLike };
  let original: WebStorageLike | undefined;

  beforeEach(() => {
    original = globalRef.localStorage;
  });

  afterEach(() => {
    if (original === undefined) {
      delete globalRef.localStorage;
    } else {
      globalRef.localStorage = original;
    }
  });

  it('uses globalThis.localStorage when it is present and usable', async () => {
    const backing = fakeBacking();
    globalRef.localStorage = backing;

    const storage = createWebStorage();
    await storage.setItem('color', 'blue');

    expect(backing.getItem('color')).toBe('blue');
  });

  it('falls back to in-memory when localStorage access throws', async () => {
    globalRef.localStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('storage disabled');
      },
      removeItem: () => undefined,
    };

    const storage = createWebStorage();
    await storage.setItem('color', 'green');
    await expect(storage.getItem('color')).resolves.toBe('green');
  });
});
