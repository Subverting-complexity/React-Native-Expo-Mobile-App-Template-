import { createExampleStore, EXAMPLE_STORAGE_KEY } from '../exampleStore';
import { makeStorageWithStore } from '@/test';

// --------------------------------------------------------------------------
// Helpers — an in-memory StorageAdapter whose methods are jest mocks, so a
// test can both drive behaviour and assert how the store called storage.
// --------------------------------------------------------------------------

function makeStorage(initial?: string) {
  return makeStorageWithStore(
    initial !== undefined ? { [EXAMPLE_STORAGE_KEY]: initial } : undefined,
  );
}

describe('createExampleStore', () => {
  it('starts at count 0 with idle status', () => {
    const store = createExampleStore({ storage: makeStorage() });
    expect(store.getState().count).toBe(0);
    expect(store.getState().status).toBe('idle');
  });

  it('increment and reset mutate count synchronously', () => {
    const store = createExampleStore({ storage: makeStorage() });

    store.getState().increment();
    store.getState().increment();
    expect(store.getState().count).toBe(2);

    store.getState().reset();
    expect(store.getState().count).toBe(0);
  });

  it('hydrate reads the persisted value through the injected storage', async () => {
    const storage = makeStorage('5');
    const store = createExampleStore({ storage });

    await store.getState().hydrate();

    expect(storage.getItem).toHaveBeenCalledWith(EXAMPLE_STORAGE_KEY);
    expect(store.getState().count).toBe(5);
    expect(store.getState().status).toBe('ready');
  });

  it('hydrate defaults to 0 when nothing is stored', async () => {
    const store = createExampleStore({ storage: makeStorage() });

    await store.getState().hydrate();

    expect(store.getState().count).toBe(0);
    expect(store.getState().status).toBe('ready');
  });

  it('hydrate falls back to 0 when the stored value is not a number', async () => {
    const store = createExampleStore({ storage: makeStorage('not-a-number') });

    await store.getState().hydrate();

    expect(store.getState().count).toBe(0);
    expect(store.getState().status).toBe('ready');
  });

  it('persist writes the current count through the injected storage', async () => {
    const storage = makeStorage();
    const store = createExampleStore({ storage });

    store.getState().increment();
    store.getState().increment();
    store.getState().increment();
    await store.getState().persist();

    expect(storage.setItem).toHaveBeenCalledWith(EXAMPLE_STORAGE_KEY, '3');
  });

  it('gives each factory call an independent store', () => {
    const a = createExampleStore({ storage: makeStorage() });
    const b = createExampleStore({ storage: makeStorage() });

    a.getState().increment();

    expect(a.getState().count).toBe(1);
    expect(b.getState().count).toBe(0);
  });
});
