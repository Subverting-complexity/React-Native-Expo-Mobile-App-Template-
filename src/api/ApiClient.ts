/** A path on the app's API, relative to the base URL. It always starts with `/`. */
export type ApiPath = `/${string}`;

export type ApiMethod = 'GET' | 'POST';

export interface ApiRequestOptions {
  /** Cancels the request. A cancelled request rejects with the abort error, not an {@link ApiError}. */
  signal?: AbortSignal;
  /** Added to the URL as a query string. */
  query?: Record<string, string | number | boolean>;
}

/**
 * The single data layer every screen uses to reach the app's API.
 *
 * Screens never call `fetch` directly. They read an `ApiClient` from
 * {@link useApi}, so demo mode can provide a different implementation and
 * leave every screen unchanged. Once real endpoints exist, typed endpoint
 * methods should wrap these generic calls.
 */
export interface ApiClient {
  /** Send a GET to `path` and parse the JSON body. An empty body is an `invalid-response` error. */
  get<T>(path: ApiPath, options?: ApiRequestOptions): Promise<T>;
  /** Send `body` as JSON in a POST to `path` and parse the JSON response. An empty body, such as a 204, gives `undefined`. */
  post<T>(
    path: ApiPath,
    body: unknown,
    options?: ApiRequestOptions,
  ): Promise<T | undefined>;
}

/**
 * - `http`: the API answered with a status outside the 2xx range.
 * - `invalid-response`: a 2xx answer whose body is not JSON, such as the SPA `index.html`.
 * - `network`: the request did not reach the API.
 * - `timeout`: the API did not answer in time.
 */
export type ApiErrorKind = 'http' | 'invalid-response' | 'network' | 'timeout';

export interface ApiErrorDetails {
  kind: ApiErrorKind;
  method: ApiMethod;
  path: ApiPath;
  /** The HTTP status. Not set for `network` and `timeout`. */
  status?: number;
  /** The response body, parsed as JSON when possible, otherwise the raw text. */
  body?: unknown;
  cause?: unknown;
}

const MESSAGES: Record<ApiErrorKind, (status?: number) => string> = {
  http: (status) => `The API returned ${status}`,
  'invalid-response': (status) =>
    `The API returned ${status} with a body that is not JSON`,
  network: () => 'The API could not be reached',
  timeout: () => 'The API did not answer in time',
};

/** Thrown for every failed {@link ApiClient} request, except one that the caller cancels. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly method: ApiMethod;
  readonly path: ApiPath;
  readonly status: number | undefined;
  readonly body: unknown;

  constructor({ kind, method, path, status, body, cause }: ApiErrorDetails) {
    super(`${MESSAGES[kind](status)} for ${method} ${path}`, { cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.method = method;
    this.path = path;
    this.status = status;
    this.body = body;
  }
}
