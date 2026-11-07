import Constants from 'expo-constants';

/**
 * Read the API base URL that the build baked into `extra.apiBaseUrl`
 * (`app.config.ts` takes it from `API_BASE_URL`). It is never a user
 * setting. A trailing slash is removed, so paths can always start with `/`.
 * Only a development build may use `http://`, for a local backend.
 */
export function readApiBaseUrl(
  extra: Record<string, unknown> | undefined = Constants.expoConfig?.extra,
  isDev: boolean = __DEV__,
): string {
  const value = extra?.apiBaseUrl;
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      'API_BASE_URL is not set for this build. Set it in .env, or as an EAS environment variable for a cloud build.',
    );
  }
  const url = value.trim().replace(/\/+$/, '');
  // Without a scheme, fetch would treat the value as a relative path.
  const scheme = isDev ? /^https?:\/\/[^/]/i : /^https:\/\/[^/]/i;
  if (!scheme.test(url)) {
    const allowed = isDev ? 'https:// or http://' : 'https://';
    throw new Error(
      `API_BASE_URL must start with ${allowed}, but it is "${url}".`,
    );
  }
  return url;
}
