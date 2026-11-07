import {
  ApiError,
  type ApiClient,
  type ApiMethod,
  type ApiPath,
  type ApiRequestOptions,
} from './ApiClient';

/** How long a request may take, response body included, when the deps do not say. */
export const DEFAULT_TIMEOUT_MS = 30_000;

export interface HttpApiClientDeps {
  /** Returns the API base URL. Read on each request, so a missing value fails the request, not app start. */
  getBaseUrl: () => string;
  fetch: typeof fetch;
  /** Milliseconds before a request fails with an `ApiError` of kind `timeout`. */
  timeoutMs?: number;
}

interface Request {
  method: ApiMethod;
  path: ApiPath;
}

interface Answer {
  status: number;
  text: string;
}

/**
 * Build the {@link ApiClient} that talks to the real API over HTTP.
 * It takes its `deps` as a factory argument, so tests inject a fake `fetch`.
 */
export function createHttpApiClient(deps: HttpApiClientDeps): ApiClient {
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  async function send(
    request: Request,
    options: ApiRequestOptions = {},
    body?: string,
  ): Promise<Answer> {
    const url = buildUrl(deps.getBaseUrl(), request.path, options.query);
    const deadline = startDeadline(timeoutMs, options.signal);
    try {
      const response = await deps.fetch(url, {
        ...buildInit(request.method, body),
        signal: deadline.signal,
      });
      const text = await response.text();
      if (!response.ok) {
        throw new ApiError({
          kind: 'http',
          ...request,
          status: response.status,
          body: parseErrorBody(text),
        });
      }
      return { status: response.status, text };
    } catch (error) {
      throw toRequestError(error, request, deadline.timedOut, options.signal);
    } finally {
      deadline.clear();
    }
  }

  return {
    async get<T>(path: ApiPath, options?: ApiRequestOptions) {
      const request: Request = { method: 'GET', path };
      return parseJson(request, await send(request, options)) as T;
    },
    async post<T>(path: ApiPath, body: unknown, options?: ApiRequestOptions) {
      const request: Request = { method: 'POST', path };
      const answer = await send(request, options, JSON.stringify(body));
      // A 204, or a 200 with no content, has no JSON to parse.
      return answer.text === '' ? undefined : (parseJson(request, answer) as T);
    },
  };
}

function buildUrl(
  baseUrl: string,
  path: ApiPath,
  query: ApiRequestOptions['query'],
): string {
  if (query === undefined) return `${baseUrl}${path}`;
  const search = new URLSearchParams(
    Object.entries(query).map(([key, value]) => [key, String(value)]),
  ).toString();
  return search === '' ? `${baseUrl}${path}` : `${baseUrl}${path}?${search}`;
}

function buildInit(method: ApiMethod, body: string | undefined): RequestInit {
  if (body === undefined) {
    return { method, headers: { Accept: 'application/json' } };
  }
  return {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body,
  };
}

/** Aborts on the caller's signal or when `timeoutMs` passes, whichever comes first. */
function startDeadline(timeoutMs: number, callerSignal?: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  if (callerSignal?.aborted) abort();
  callerSignal?.addEventListener('abort', abort);

  return {
    signal: controller.signal,
    get timedOut() {
      return timedOut;
    },
    clear() {
      clearTimeout(timer);
      callerSignal?.removeEventListener('abort', abort);
    },
  };
}

function toRequestError(
  error: unknown,
  request: Request,
  timedOut: boolean,
  callerSignal: AbortSignal | undefined,
): unknown {
  if (error instanceof ApiError || callerSignal?.aborted) return error;
  return new ApiError({
    kind: timedOut ? 'timeout' : 'network',
    ...request,
    cause: error,
  });
}

function parseJson(request: Request, { status, text }: Answer): unknown {
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ApiError({
      kind: 'invalid-response',
      ...request,
      status,
      body: text,
      cause,
    });
  }
}

function parseErrorBody(text: string): unknown {
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
