import { getExtra } from '@/lib/env';

type ConfigureOptions = {
  getToken: () => string | null;
  onUnauthorized: () => void | Promise<void>;
  /** Return true after rotating access token so the caller can retry once. */
  refreshAccessToken?: () => Promise<boolean>;
};

let getToken: () => string | null = () => null;
let onUnauthorized: () => void | Promise<void> = () => {};
let refreshAccessToken: (() => Promise<boolean>) | null = null;

export function configureApiClient(options: ConfigureOptions): void {
  getToken = options.getToken;
  onUnauthorized = options.onUnauthorized;
  refreshAccessToken = options.refreshAccessToken ?? null;
}

function joinBasePath(base: string, path: string): string {
  const trimmedBase = base.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${normalizedPath}`;
}

async function handleAuthFailure(status: number): Promise<void> {
  // Only 401 indicates an invalid/expired session. 403 is authorization or
  // feature gating (e.g. pending device) and must not clear stored tokens.
  if (status !== 401) {
    return;
  }
  await Promise.resolve(onUnauthorized());
}

export type ApiRequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiRequest(path: string, init: ApiRequestOptions = {}): Promise<Response> {
  const { apiBaseUrl } = getExtra();
  if (!apiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL. Configure your .env for this environment.');
  }

  const { skipAuth, headers, ...rest } = init;

  const buildHeaders = (): Headers => {
    const merged = new Headers(headers);
    merged.set('Accept', 'application/json');
    if (!skipAuth) {
      const token = getToken();
      if (token) {
        merged.set('Authorization', `Bearer ${token}`);
      }
    }
    return merged;
  };

  const url = joinBasePath(apiBaseUrl, path);

  const send = async (): Promise<Response> =>
    fetch(url, {
      ...rest,
      headers: buildHeaders(),
    });

  let response = await send();

  if (response.status === 401 && refreshAccessToken && !skipAuth) {
    const rotated = await refreshAccessToken();
    if (rotated) {
      response = await send();
    }
  }

  await handleAuthFailure(response.status);
  return response;
}

export async function apiJson<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  const response = await apiRequest(path, init);
  if (!response.ok) {
    const text = await response.text();
    let message = `Request failed (${response.status})`;
    try {
      const body = JSON.parse(text) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}
