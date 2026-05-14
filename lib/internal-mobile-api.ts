import { getExtra } from '@/lib/env';

const PREFIX = '/api/v1/internal-mobile';

function joinUrl(relPath: string): string {
  const { apiBaseUrl } = getExtra();
  if (!apiBaseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_BASE_URL. Configure your .env for this environment.');
  }
  const base = apiBaseUrl.replace(/\/+$/, '');
  const p = relPath.startsWith('/') ? relPath : `/${relPath}`;
  return `${base}${PREFIX}${p}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    if (body && typeof body === 'object') {
      const r = body as Record<string, unknown>;
      if (typeof r.message === 'string') {
        message = r.message;
      } else if (r.errors && typeof r.errors === 'object') {
        const errs = r.errors as Record<string, unknown>;
        const firstKey = Object.keys(errs)[0];
        if (firstKey) {
          const v = errs[firstKey];
          if (Array.isArray(v) && typeof v[0] === 'string') {
            message = v[0];
          }
        }
      }
    }
    const err = new Error(message) as Error & { status?: number; body?: unknown };
    err.status = response.status;
    err.body = body;
    throw err;
  }

  return body as T;
}

export async function postInternalMobile<T>(
  relPath: string,
  body: unknown,
  accessToken?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(joinUrl(relPath), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return parseJsonResponse<T>(response);
}

export async function getInternalMobile<T>(relPath: string, accessToken: string): Promise<T> {
  const response = await fetch(joinUrl(relPath), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseJsonResponse<T>(response);
}
