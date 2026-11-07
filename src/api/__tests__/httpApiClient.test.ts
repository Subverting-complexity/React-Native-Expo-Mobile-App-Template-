import { ApiError } from '../ApiClient';
import { createHttpApiClient, type HttpApiClientDeps } from '../httpApiClient';

function makeFetch(status: number, text: string) {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(text),
  });
}

function makeJsonFetch(status: number, body: unknown) {
  return makeFetch(status, JSON.stringify(body));
}

/** A fetch that never answers, and rejects only when its signal aborts. */
function makeHangingFetch() {
  return jest.fn(
    (_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const abort = () => reject(new Error('Aborted'));
        if (init.signal?.aborted) abort();
        init.signal?.addEventListener('abort', abort);
      }),
  );
}

function makeClient(
  fetch: jest.Mock,
  overrides: Partial<HttpApiClientDeps> = {},
) {
  return createHttpApiClient({
    getBaseUrl: () => 'https://api.example.test',
    fetch,
    ...overrides,
  });
}

describe('createHttpApiClient', () => {
  it('sends a GET to the base URL plus the path and returns the JSON body', async () => {
    const fetch = makeJsonFetch(200, { items: [1, 2] });

    await expect(makeClient(fetch).get('/v1/items')).resolves.toEqual({
      items: [1, 2],
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/v1/items',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('asks for JSON and sends no Content-Type on a GET', async () => {
    const fetch = makeJsonFetch(200, {});

    await makeClient(fetch).get('/x');
    expect(fetch.mock.calls[0][1].headers).toEqual({
      Accept: 'application/json',
    });
  });

  it('sends a POST with the body as JSON', async () => {
    const fetch = makeJsonFetch(200, { id: 7 });

    await expect(
      makeClient(fetch).post('/v1/messages', { text: 'Hi' }),
    ).resolves.toEqual({ id: 7 });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ text: 'Hi' }),
      }),
    );
  });

  it('keeps the path prefix of the base URL', async () => {
    const fetch = makeJsonFetch(200, {});

    await makeClient(fetch, {
      getBaseUrl: () => 'https://api.example.test/v1',
    }).get('/v1/report');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/v1/v1/report',
      expect.anything(),
    );
  });

  it('adds the query as an encoded query string', async () => {
    const fetch = makeJsonFetch(200, {});

    await makeClient(fetch).get('/v1/alerts', {
      query: { from: '2026-11-03', limit: 20, unread: true, q: 'a&b c' },
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.test/v1/alerts?from=2026-11-03&limit=20&unread=true&q=a%26b+c',
      expect.anything(),
    );
  });

  it('returns undefined for a POST response with no body, such as a 204', async () => {
    const fetch = makeFetch(204, '');

    await expect(
      makeClient(fetch).post('/v1/messages/read', {}),
    ).resolves.toBeUndefined();
  });

  it('throws an http ApiError with the status, method, path and JSON body for a non-2xx response', async () => {
    const client = makeClient(makeJsonFetch(400, { title: 'Bad input' }));

    const error = await client.post('/v1/messages', {}).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      kind: 'http',
      status: 400,
      method: 'POST',
      path: '/v1/messages',
      body: { title: 'Bad input' },
    });
  });

  it('keeps a non-JSON error body as text', async () => {
    const client = makeClient(makeFetch(503, 'Service Unavailable'));

    await expect(client.get('/v1/report')).rejects.toMatchObject({
      kind: 'http',
      status: 503,
      body: 'Service Unavailable',
    });
  });

  it.each([
    [
      'an HTML page, such as the SPA index.html',
      '<!doctype html><html></html>',
    ],
    ['malformed JSON', '{"items": ['],
    ['an empty body on a GET', ''],
  ])(
    'throws an invalid-response ApiError for a 2xx with %s',
    async (_label, text) => {
      const client = makeClient(makeFetch(200, text));

      await expect(client.get('/v1/unknown')).rejects.toMatchObject({
        kind: 'invalid-response',
        status: 200,
        method: 'GET',
        path: '/v1/unknown',
      });
    },
  );

  it('throws a network ApiError, with the cause, when fetch fails', async () => {
    const cause = new TypeError('Network down');
    const fetch = jest.fn().mockRejectedValue(cause);

    const error = await makeClient(fetch)
      .get('/x')
      .catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'network', status: undefined, cause });
  });

  describe('timeout and cancellation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('throws a timeout ApiError when the API does not answer in time', async () => {
      const client = makeClient(makeHangingFetch(), { timeoutMs: 1000 });

      const result = client.get('/x').catch((e) => e);
      jest.advanceTimersByTime(1000);
      const error = await result;
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ kind: 'timeout', method: 'GET' });
    });

    it('does not time out a request that answers in time', async () => {
      const client = makeClient(makeJsonFetch(200, { ok: true }), {
        timeoutMs: 1000,
      });

      await expect(client.get('/x')).resolves.toEqual({ ok: true });
      expect(jest.getTimerCount()).toBe(0);
    });

    it('rejects with the abort error, not an ApiError, when the caller cancels', async () => {
      const controller = new AbortController();
      const client = makeClient(makeHangingFetch());

      const result = client
        .get('/x', { signal: controller.signal })
        .catch((e) => e);
      controller.abort();
      const error = await result;
      expect(error).not.toBeInstanceOf(ApiError);
      expect(error).toEqual(new Error('Aborted'));
    });

    it('aborts at once when the caller signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      const fetch = makeHangingFetch();

      await expect(
        makeClient(fetch).get('/x', { signal: controller.signal }),
      ).rejects.toThrow('Aborted');
    });
  });

  it('fails the request, not the client, when the base URL is missing', async () => {
    const fetch = makeJsonFetch(200, {});
    const client = makeClient(fetch, {
      getBaseUrl: () => {
        throw new Error('not set');
      },
    });

    await expect(client.get('/x')).rejects.toThrow('not set');
    expect(fetch).not.toHaveBeenCalled();
  });
});
