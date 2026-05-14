import { router, type Href } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { configureApiClient } from '@/lib/api';
import {
  clearStoredInternalMobileSession,
  getStoredInternalMobileSession,
  setStoredInternalMobileSession,
} from '@/lib/auth-storage';
import { buildInternalMobileDevicePayload, type InternalMobileDevicePayload } from '@/lib/device-metadata';
import { clearPendingInternalAuth, getPendingMfa, getPendingSsoLink, setPendingMfa, setPendingSsoLink, clearPendingMfa, clearPendingSsoLink } from '@/lib/internal-auth-pending';
import { getExtra } from '@/lib/env';
import { getInternalMobile, postInternalMobile } from '@/lib/internal-mobile-api';
import { isAuthenticatedExchange, parseAuthExchangeBody } from '@/lib/internal-mobile-auth-response';
import { getOrCreateInstallationId } from '@/lib/installation-id';

export type MobileAccess = 'none' | 'unknown' | 'restricted_pending_device' | 'full';

type UserSummary = { id: number; name: string; email: string };

type IssuedTokens = {
  access_token: string;
  refresh_token: string;
};

type AuthContextValue = {
  /** Bearer access token for internal mobile API (`imi_…`). */
  token: string | null;
  isReady: boolean;
  mobileAccess: MobileAccess;
  userSummary: UserSummary | null;
  syncBootstrap: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  signInWithAppleIdentityToken: (identityToken: string) => Promise<void>;
  /** Completes login after `/auth/link-sso` or `/auth/mfa-verify` (handles chained MFA). */
  completeAuthExchange: (body: unknown) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseMobileAccess(payload: unknown): MobileAccess {
  if (!payload || typeof payload !== 'object') {
    return 'unknown';
  }
  const r = payload as Record<string, unknown>;
  if (r.mobile_access === 'restricted_pending_device') {
    return 'restricted_pending_device';
  }
  const app = r.app;
  if (app && typeof app === 'object') {
    const posture = (app as Record<string, unknown>).posture;
    if (posture === 'internal_only') {
      // Server grants operator tools (distinct from consumer-only posture when added later).
      return 'full';
    }
  }
  return 'unknown';
}

function extractUserSummary(payload: unknown): UserSummary | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const u = (payload as Record<string, unknown>).user;
  if (!u || typeof u !== 'object') {
    return null;
  }
  const o = u as Record<string, unknown>;
  const id = typeof o.id === 'number' ? o.id : Number(o.id);
  const name = typeof o.name === 'string' ? o.name : '';
  const email = typeof o.email === 'string' ? o.email : '';
  if (!Number.isFinite(id) || !email) {
    return null;
  }
  return { id, name, email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [mobileAccess, setMobileAccess] = useState<MobileAccess>('none');
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [isReady, setIsReady] = useState(false);

  const accessRef = useRef<string | null>(null);
  const refreshRef = useRef<string | null>(null);
  const mobileAccessRef = useRef<MobileAccess>('none');

  useEffect(() => {
    accessRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    refreshRef.current = refreshToken;
  }, [refreshToken]);

  useEffect(() => {
    mobileAccessRef.current = mobileAccess;
  }, [mobileAccess]);

  const persistSession = useCallback(async (access: string, refresh: string) => {
    accessRef.current = access;
    refreshRef.current = refresh;
    await setStoredInternalMobileSession(access, refresh);
    setAccessToken(access);
    setRefreshTokenState(refresh);
  }, []);

  const hydrateBootstrap = useCallback(async (access: string): Promise<MobileAccess> => {
    try {
      const payload = await getInternalMobile<unknown>('/bootstrap', access);
      const next = parseMobileAccess(payload);
      setMobileAccess(next);
      setUserSummary(extractUserSummary(payload));
      return next;
    } catch (e) {
      const status =
        typeof e === 'object' && e !== null && 'status' in e ? (e as { status?: number }).status : undefined;
      if (status === 401 || status === 403) {
        await clearStoredInternalMobileSession();
        accessRef.current = null;
        refreshRef.current = null;
        setAccessToken(null);
        setRefreshTokenState(null);
        setMobileAccess('none');
        setUserSummary(null);
        return 'none';
      }
      setMobileAccess('unknown');
      return 'unknown';
    }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const rt = refreshRef.current;
    if (!rt) {
      return false;
    }
    try {
      const body = await postInternalMobile<unknown>(
        '/auth/refresh',
        { refresh_token: rt },
        null,
      );
      const parsed = parseAuthExchangeBody(body);
      if (!parsed || !isAuthenticatedExchange(parsed)) {
        return false;
      }
      await persistSession(parsed.access_token, parsed.refresh_token);
      await hydrateBootstrap(parsed.access_token);
      return true;
    } catch {
      return false;
    }
  }, [hydrateBootstrap, persistSession]);

  const signOut = useCallback(async () => {
    const at = accessRef.current;
    try {
      if (at) {
        await postInternalMobile<{ ok: boolean }>('/auth/logout', {}, at);
      }
    } catch {
      // Session may already be revoked server-side.
    }
    await clearStoredInternalMobileSession();
    accessRef.current = null;
    refreshRef.current = null;
    setAccessToken(null);
    setRefreshTokenState(null);
    setMobileAccess('none');
    setUserSummary(null);
    clearPendingInternalAuth();
    router.replace('/(public)/(tabs)' as Href);
  }, []);

  useEffect(() => {
    configureApiClient({
      getToken: () => accessRef.current,
      refreshAccessToken,
      onUnauthorized: () => {
        void signOut();
      },
    });
  }, [refreshAccessToken, signOut]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await getStoredInternalMobileSession();
      if (cancelled) {
        return;
      }

      if (!stored?.accessToken || !stored.refreshToken) {
        setIsReady(true);
        return;
      }

      accessRef.current = stored.accessToken;
      refreshRef.current = stored.refreshToken;
      setAccessToken(stored.accessToken);
      setRefreshTokenState(stored.refreshToken);

      let next = await hydrateBootstrap(stored.accessToken);
      if (cancelled) {
        return;
      }

      if (next === 'none') {
        try {
          const body = await postInternalMobile<unknown>(
            '/auth/refresh',
            { refresh_token: stored.refreshToken },
            null,
          );
          const parsed = parseAuthExchangeBody(body);
          if (!parsed || !isAuthenticatedExchange(parsed)) {
            throw new Error('Invalid refresh response');
          }
          await persistSession(parsed.access_token, parsed.refresh_token);
          next = await hydrateBootstrap(parsed.access_token);
        } catch {
          await clearStoredInternalMobileSession();
          accessRef.current = null;
          refreshRef.current = null;
          setAccessToken(null);
          setRefreshTokenState(null);
          setMobileAccess('none');
          setUserSummary(null);
        }
      }

      if (!cancelled) {
        setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrateBootstrap, persistSession]);

  const buildDevicePayload = useCallback(async () => {
    const installationId = await getOrCreateInstallationId();
    return buildInternalMobileDevicePayload(installationId);
  }, []);

  const navigateAfterBootstrap = useCallback((next: MobileAccess) => {
    if (next === 'restricted_pending_device') {
      router.replace('/(internal)/device-pending' as Href);
      return;
    }
    if (next === 'full' || next === 'unknown') {
      router.replace('/(internal)/(tabs)/dashboard');
    }
  }, []);

  const applyIssuedTokensThenNavigate = useCallback(
    async (body: IssuedTokens) => {
      await persistSession(body.access_token, body.refresh_token);
      const next = await hydrateBootstrap(body.access_token);
      navigateAfterBootstrap(next);
    },
    [hydrateBootstrap, navigateAfterBootstrap, persistSession],
  );

  const routeAuthExchangeSideEffects = useCallback(
    async (device: InternalMobileDevicePayload, body: unknown) => {
      const parsed = parseAuthExchangeBody(body);
      if (!parsed) {
        throw new Error('Unexpected authentication response from server.');
      }
      if (parsed.auth_state === 'sso_link_required') {
        if (!parsed.sso_assertion || !parsed.provider) {
          throw new Error('Missing SSO link payload from server.');
        }
        setPendingSsoLink({
          assertion: parsed.sso_assertion,
          provider: parsed.provider,
          maskedEmail: parsed.masked_email ?? '',
          device,
        });
        router.push('/(auth)/link-work-account' as Href);
        return;
      }
      if (parsed.auth_state === 'mfa_required') {
        if (!parsed.mfa_challenge_id) {
          throw new Error('Missing MFA challenge from server.');
        }
        setPendingMfa({
          challengeId: parsed.mfa_challenge_id,
          hint: parsed.hint ?? '',
          device,
        });
        router.push('/(auth)/mfa-challenge' as Href);
        return;
      }
      if (isAuthenticatedExchange(parsed)) {
        await applyIssuedTokensThenNavigate({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });
        return;
      }
      throw new Error('Unsupported authentication state from server.');
    },
    [applyIssuedTokensThenNavigate],
  );

  const completeAuthExchange = useCallback(
    async (body: unknown) => {
      const parsed = parseAuthExchangeBody(body);
      if (!parsed) {
        throw new Error('Unexpected authentication response from server.');
      }
      if (parsed.auth_state === 'mfa_required') {
        if (!parsed.mfa_challenge_id) {
          throw new Error('Missing MFA challenge from server.');
        }
        const fromSso = getPendingSsoLink();
        const fromMfa = getPendingMfa();
        const device = fromSso?.device ?? fromMfa?.device;
        if (!device) {
          throw new Error('MFA challenge is missing device context. Sign in again.');
        }
        setPendingMfa({
          challengeId: parsed.mfa_challenge_id,
          hint: parsed.hint ?? '',
          device,
        });
        clearPendingSsoLink();
        router.replace('/(auth)/mfa-challenge' as Href);
        return;
      }
      if (isAuthenticatedExchange(parsed)) {
        clearPendingSsoLink();
        clearPendingMfa();
        await applyIssuedTokensThenNavigate({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        });
        return;
      }
      throw new Error('Unsupported authentication state from server.');
    },
    [applyIssuedTokensThenNavigate],
  );

  const signInWithGoogleIdToken = useCallback(
    async (idToken: string) => {
      if (!getExtra().apiBaseUrl) {
        throw new Error('Missing EXPO_PUBLIC_API_BASE_URL. Add it to your .env before signing in.');
      }
      const device = await buildDevicePayload();
      const body = await postInternalMobile<unknown>(
        '/auth/google',
        { id_token: idToken, device },
        null,
      );
      await routeAuthExchangeSideEffects(device, body);
    },
    [buildDevicePayload, routeAuthExchangeSideEffects],
  );

  const signInWithAppleIdentityToken = useCallback(
    async (identityToken: string) => {
      if (!getExtra().apiBaseUrl) {
        throw new Error('Missing EXPO_PUBLIC_API_BASE_URL. Add it to your .env before signing in.');
      }
      const device = await buildDevicePayload();
      const body = await postInternalMobile<unknown>(
        '/auth/apple',
        { identity_token: identityToken, device },
        null,
      );
      await routeAuthExchangeSideEffects(device, body);
    },
    [buildDevicePayload, routeAuthExchangeSideEffects],
  );

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const extra = getExtra();
      if (!extra.apiBaseUrl) {
        throw new Error('Missing EXPO_PUBLIC_API_BASE_URL. Add it to your .env before signing in.');
      }
      if (!extra.internalMobilePasswordAuthEnabled) {
        throw new Error('Password sign-in is not enabled for this build.');
      }
      const device = await buildDevicePayload();
      const body = await postInternalMobile<unknown>(
        '/auth/password',
        { email: email.trim(), password, device },
        null,
      );
      await routeAuthExchangeSideEffects(device, body);
    },
    [buildDevicePayload, routeAuthExchangeSideEffects],
  );

  const syncBootstrap = useCallback(async () => {
    const at = accessRef.current;
    if (!at) {
      return;
    }
    const prev = mobileAccessRef.current;
    const next = await hydrateBootstrap(at);
    if (prev === 'restricted_pending_device' && next === 'full') {
      router.replace('/(internal)/(tabs)/dashboard');
    }
  }, [hydrateBootstrap]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: accessToken,
      isReady,
      mobileAccess,
      userSummary,
      syncBootstrap,
      signInWithPassword,
      signInWithGoogleIdToken,
      signInWithAppleIdentityToken,
      completeAuthExchange,
      signOut,
    }),
    [
      accessToken,
      completeAuthExchange,
      isReady,
      mobileAccess,
      signInWithAppleIdentityToken,
      signInWithGoogleIdToken,
      signInWithPassword,
      signOut,
      syncBootstrap,
      userSummary,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
