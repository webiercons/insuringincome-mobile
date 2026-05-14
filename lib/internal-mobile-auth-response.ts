export type InternalMobileAuthState = 'authenticated' | 'sso_link_required' | 'mfa_required';

export type InternalMobileAuthExchangeBody = {
  auth_state: InternalMobileAuthState;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  device?: { id: number; approval_status: string };
  provider?: string;
  masked_email?: string;
  sso_assertion?: string;
  mfa_challenge_id?: string;
  hint?: string;
};

export function parseAuthExchangeBody(body: unknown): InternalMobileAuthExchangeBody | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const o = body as Record<string, unknown>;
  const authState = o.auth_state;
  if (authState === 'authenticated' || authState === 'sso_link_required' || authState === 'mfa_required') {
    return body as InternalMobileAuthExchangeBody;
  }
  if (typeof o.access_token === 'string' && typeof o.refresh_token === 'string') {
    return {
      auth_state: 'authenticated',
      access_token: o.access_token,
      refresh_token: o.refresh_token,
      token_type: typeof o.token_type === 'string' ? o.token_type : undefined,
      expires_in: typeof o.expires_in === 'number' ? o.expires_in : undefined,
      device:
        o.device && typeof o.device === 'object'
          ? (o.device as { id: number; approval_status: string })
          : undefined,
    };
  }
  return null;
}

export function isAuthenticatedExchange(
  body: InternalMobileAuthExchangeBody,
): body is InternalMobileAuthExchangeBody & { auth_state: 'authenticated'; access_token: string; refresh_token: string } {
  return body.auth_state === 'authenticated' && !!body.access_token && !!body.refresh_token;
}
