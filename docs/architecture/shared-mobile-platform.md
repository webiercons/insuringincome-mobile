# Shared mobile platform (Expo / React Native)

Companion: [Shared platform strategy](./shared-platform-strategy.md) · [Laravel foundation](./shared-laravel-foundation.md)

This doc turns the **Insuring Income** mobile implementation into a reusable pattern for Meddr, Espressly, and Webier-family apps.

---

## 1. What “shared mobile” should be

**In scope for shared packages**

- Typed API client (base URL, path prefix, JSON errors, bearer injection).
- Auth **state machine** (`authenticated` | `sso_link_required` | `mfa_required`) and parsers.
- Device/installation payloads for server-side trust decisions.
- OTA/diagnostics **read-only** helpers (no policy in the package — app wires UX).
- Secure storage helpers for access/refresh tokens (namespaced keys per `slug`).

**Out of scope initially**

- Full navigation graphs, tab shells, marketing screens.
- Company icons, splash screens, bundle identifiers (`app.config.ts` stays app-owned).

---

## 2. Insuring Income reference map

| Concern | Implementation reference |
|---------|--------------------------|
| API prefix | `lib/internal-mobile-api.ts` — `PREFIX = '/api/v1/internal-mobile'` |
| Env → runtime | `lib/env.ts`, `app.config.ts` `extra` block |
| Session storage | `lib/auth-storage.ts` — SecureStore |
| Auth exchange + refresh | `contexts/auth-context.tsx` |
| Response contract | `lib/internal-mobile-auth-response.ts` |
| Pending link / MFA | `lib/internal-auth-pending.ts` |
| Device payload | `lib/device-metadata.ts` |
| OTA + channel | `eas.json` `build.*.channel`, `app.config.ts` `updates` |
| Runtime version | `runtimeVersion: { policy: 'appVersion' }` |
| Diagnostics | `hooks/use-internal-diagnostics.ts` |
| Runbooks | `docs/internal-mobile-release-runbook.md`, `docs/internal-mobile-dependency-roadmap.md` |

---

## 3. Candidate npm packages

| Package | Contents (from current repo) | Peer deps |
|---------|------------------------------|-----------|
| `@webier/mobile-api-client` | `joinUrl`, `parseJsonResponse`, `get`/`post` with optional bearer | none beyond `fetch` |
| `@webier/mobile-auth` | `parseAuthExchangeBody`, `isAuthenticatedExchange`, pending types | React optional |
| `@webier/mobile-device-trust` | Installation id + `buildInternalMobileDevicePayload` | `expo-application`, `expo-constants` |
| `@webier/mobile-ota-diagnostics` | Snapshot + branch extraction from `expo-updates` | `expo-updates`, `expo-constants` |
| `@webier/mobile-notifications` | **Defer** until push registration payload is identical across apps | `expo-notifications` |
| `@webier/mobile-document-center` | **Defer** — UI + permissions vary | — |
| `@webier/mobile-operations-shell` | **Defer** — likely product-specific nav | — |

Package names are placeholders; use your org scope on npm.

---

## 4. OTA / TestFlight / store strategy

### Channels and binaries

This repo’s pattern is the **default recommendation**:

- EAS **build profiles** each set `channel` to `development` | `preview` | `testflight` | `production`.
- **OTA publishes** must target the **same channel** as the binary that operators installed (`package.json` scripts `ota:preview`, etc.).

### Runtime version

`runtimeVersion.policy: appVersion'` ties the OTA runtime to the **semver in the binary**. Rules:

- **JS-only fix** → bump `version` only if policy requires it, or use a policy that matches your comfort; with `appVersion`, **any** native-affecting change must bump app version and ship a new binary before OTAs that depend on new native APIs.
- Document a **native change checklist** (already in dependency roadmap) before every store build.

### TestFlight vs production

- **TestFlight** channel for pre-prod acceptance; **production** for released operators.
- **Preview** for internal dogfood (Ad Hoc / internal distribution).
- Never point production API URLs at preview channels without explicit env in that binary.

### User-visible updates

`checkAutomatically: 'NEVER'` + manual check (see diagnostics hook) avoids mid-task reloads; shared package should preserve **operator-controlled** reload semantics.

---

## 5. Auth + device governance (client side)

1. SSO (Apple / Google) completes on device.
2. Client sends **identity token** + **device payload** to Laravel.
3. Server responds with `auth_state`:
   - **`authenticated`** — tokens returned (after server-side MFA/device rules).
   - **`sso_link_required`** — client shows “Link your work account”; pending payload holds `sso_assertion` + device.
   - **`mfa_required`** — client shows MFA challenge; pending holds `mfa_challenge_id` + device.
4. Client must **not** log raw tokens; use SecureStore only.

Shared package exports **types + parsers + API helpers**; screens remain app-specific but thin.

---

## 6. Configuration philosophy (mobile)

| Layer | Mechanism |
|-------|-----------|
| Build-time public config | `EXPO_PUBLIC_*` via `app.config.ts` → `extra` |
| Channel label | `EXPO_PUBLIC_APP_CHANNEL` from `eas.json` per profile |
| Feature toggles | Public flags only; secrets never in `EXPO_PUBLIC_*` |

Per-company: different `slug`, bundle id, Google OAuth client IDs, API base URL — same code paths.

---

## 7. CI expectations

- `npm run typecheck` + `npm run lint` on every PR.
- Optional: `npm run bundle:check` on release branches.
- Regenerate router types when routes change (`router:types` script).

---

## 8. Extraction order (practical)

1. `@webier/mobile-api-client` — zero UI, easiest to test.
2. `@webier/mobile-auth` + `@webier/mobile-device-trust` — used together in sign-in.
3. `@webier/mobile-ota-diagnostics` — independent of auth.

Keep **Expo Router routes and layouts** in the app until two apps share identical operator IA.

---

## Risks (mobile-specific)

- **Tight coupling to `expo-router`** in `auth-context` — extract logic into framework-agnostic modules first.
- **SecureStore key collision** if packages use fixed keys — prefix with `slug` or `bundleIdentifier` hash.
