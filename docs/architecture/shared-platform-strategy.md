# Shared operational platform strategy

This document is the umbrella strategy for **Insuring Income**, **Meddr**, **Espressly**, and future **Webier** applications that share PHP/Laravel backends and Expo/React Native clients. It exists to prevent uncontrolled copy/paste while **not** forcing a monorepo or big-bang rewrite.

**Companion docs**

- [Shared mobile platform](./shared-mobile-platform.md) — Expo, EAS Update, client auth/device patterns.
- [Shared Laravel foundation](./shared-laravel-foundation.md) — Composer packages, API contracts, server-side governance.

---

## 1. Principles

| Principle | Meaning |
|-----------|---------|
| **Internal identity first** | Canonical user lives in each product’s domain model; SSO attaches; no silent “public” user creation from Apple/Google alone. |
| **Configurable posture** | Same packages, different env keys and policy tiers per company (MFA strictness, device approval, OTA aggressiveness). |
| **Contract over implementation** | Shared behavior is defined by **HTTP + JSON contracts**, **env key catalogs**, and **typed client parsers** before code moves into packages. |
| **Extract after the second use** | First app owns the code; second app that needs the same behavior drives extraction boundaries. |
| **Preserve shipping apps** | Package extraction is incremental; semver and compatibility matrices gate upgrades. |

---

## 2. Architectural foundation (four layers)

1. **Shared Laravel packages (Composer)** — Auth/device/MFA hooks, env discipline, audit primitives, optional vertical slices (documents, uploads) where truly common.
2. **Shared Expo/mobile packages (npm)** — Thin SDKs: API client + auth state machine + device payload + OTA/diagnostics helpers; **not** full UI kits unless proven identical.
3. **Shared operational tooling** — Scripts and CI jobs: `env:keys` / `env:doctor`, EAS channel checks, release checklists, version matrix verification (documented first, scripted second).
4. **Shared environment governance** — Single **catalog** of env vars per layer (Laravel, EAS build env, Expo `EXPO_PUBLIC_*`), with per-company `.env.example` deltas only where needed.

Branding, copy, navigation trees, and industry-specific workflows stay **app-specific**.

---

## 3. Insuring Income (mobile repo) audit — portable vs product-specific

*Workspace audited: `insuringincome-mobile` (Laravel lives in sibling `insuringincome`; patterns described there align with README and internal-mobile docs.)*

### Highly portable (strong package candidates)

| Area | Location (indicative) | Why portable |
|------|----------------------|--------------|
| JSON API client + error shaping | `lib/internal-mobile-api.ts` | Prefix + `fetch` + consistent error extraction is generic. |
| Auth response parsing | `lib/internal-mobile-auth-response.ts` | `auth_state` union + guards map to any app using the same contract. |
| Pending SSO / MFA in-memory handoff | `lib/internal-auth-pending.ts` | Same state machine if backend emits same states. |
| Device/installation payload | `lib/device-metadata.ts`, `lib/installation-id.ts` | Stable shape for “device governance” backends. |
| Secure token storage abstraction | `lib/auth-storage.ts` | SecureStore patterns are reusable; key namespaces per app. |
| Env → `extra` bridge | `lib/env.ts` + `app.config.ts` pattern | Same pattern with different keys in `extra`. |
| OTA/diagnostics snapshot | `hooks/use-internal-diagnostics.ts` | Channel/runtime/update metadata is generic. |
| EAS channel discipline | `eas.json`, `docs/internal-mobile-release-runbook.md` | Reusable as templates. |

### Product-specific (keep in app)

| Area | Why stay local |
|------|------------------|
| `app.config.ts` branding, bundle IDs, scheme, icons, splash | Legal and store identity per company. |
| Tab layouts, screens, insurance copy | Business domain. |
| Theme tokens (`constants/internal-theme.ts`, public theme) | Brand; may share a “token schema” later, not identical values. |
| Google/Apple **client IDs** in env | Per Apple/Google cloud projects per app. |
| EAS `projectId` | Per Expo project. |

### Hybrid (shared interface, local wiring)

| Area | Approach |
|------|----------|
| `contexts/auth-context.tsx` | Extract **pure functions** + **hooks factory** into a package; app supplies route names, `router.replace` targets, and company-specific `completeAuthExchange` side effects. |
| Auth screens (`login`, `link-work-account`, `mfa-challenge`) | Shared **screen primitives** or copy-paste once with package owning **validation + API calls** only. |

---

## 4. Initial package boundaries (recommended)

### Laravel (Composer) — suggested grouping

Avoid fifteen micro-packages on day one. Start with **three installable units**; split when a second app needs only one slice.

| Package (logical) | Suggested physical package | Responsibility |
|-------------------|----------------------------|----------------|
| `InternalMobileAuth` + SSO link + MFA gate | **`webier/laravel-internal-mobile-auth`** | Routes, controllers, services, token issuance, `auth_state` contract, Fortify integration points. |
| `DeviceGovernance` + sessions/devices | **`webier/laravel-device-governance`** | Device registration, trust states, installation binding for MFA challenges, revoke APIs. |
| `EnvironmentDiscipline` | **`webier/laravel-env-discipline`** | `env:keys`, `env:doctor`, optional manifest of required keys per deployment profile. |

**Defer or merge until second consumer:**

- `OperationalNotifications` — if all apps use same push ingestion model; else keep app webhooks.
- `OperationalTelemetry` / `AiRuntimeGovernance` / `DocumentIntelligence` / `SecureUploads` / `RelationshipMemory` / `WorkflowEngine` — **vertical** concerns; extract only when two apps share the same data model and API, not just the English name.

### Expo (npm) — suggested grouping

| Package | Responsibility |
|---------|------------------|
| `@webier/mobile-api-client` | Base URL + auth header + JSON errors (generalization of `internal-mobile-api.ts`). |
| `@webier/mobile-auth` | Auth state types, parsers, pending link/MFA state, optional React context **interfaces**. |
| `@webier/mobile-device-trust` | Installation ID + device payload builders. |
| `@webier/mobile-ota-diagnostics` | `expo-updates` snapshot helpers (from `use-internal-diagnostics`). |
| `@webier/mobile-operations-shell` | **Last** — only if multiple apps share identical operator nav; else keep per-app. |

Document center / notifications can start as **recipes** in docs, not packages.

---

## 5. Version harmony strategy

| Stack | Policy |
|-------|--------|
| **PHP** | One **supported major** per calendar year for *new* shared packages; apps may lag one major with a documented exception (security patches only). |
| **Laravel** | Shared packages target **one Laravel minor series** (e.g. 11.x); bump major in shared packages only with a written migration note and simultaneous consumer updates. |
| **Expo SDK** | **Pin** SDK per app release line; shared mobile packages declare `peerDependencies` on `expo` range matching that line. Upgrade SDK on a **quarterly** window, not ad hoc. |
| **Node / npm** | Volta or `engines` in root; CI uses the same Node as local. |
| **CI/CD** | Every PR: lint + typecheck + unit tests; mobile optional `expo export` smoke on release branches. |
| **OTA compatibility** | **Runtime version policy** must match across binaries on a channel (this repo uses `runtimeVersion.policy: appVersion` — see mobile doc). Never publish OTA to a channel served by incompatible binaries. |
| **Package upgrades** | Shared package semver: **PATCH** safe without app changes; **MINOR** may need config; **MAJOR** explicit upgrade guide. |

---

## 6. Configuration philosophy

- **Shared defaults** — Packages ship `config/*.php` and documented `EXPO_PUBLIC_*` defaults (empty = disabled).
- **Per-company overrides** — `.env` / EAS `build.*.env` only; no secrets in repo.
- **Environment posture** — `local` / `preview` / `testflight` / `production` channel names align with EAS channels (this repo already does).
- **Security posture tiers** (example): **T0** dev relaxed; **T1** MFA optional; **T2** MFA + device trust required for internal; **T3** T2 + shorter refresh + IP/geo signals if available.
- **Feature flags** — Laravel `config()` + optional remote config later; mobile reads only **non-secret** flags from bootstrap.
- **Provider selection** — Which SSO providers are enabled is config, not code forks.

---

## 7. Deployment philosophy

- **Shared deploy scripts** — Start as **documented** bash/Make targets in each repo, identical names (`release:ios:testflight`, `ota:production`); extract to a small `webier/deploy-tools` repo only when duplication hurts.
- **Environment validation** — `env:doctor` (or equivalent) in CI before build artifacts.
- **OTA channels** — Branch/channel parity (already documented in `docs/internal-mobile-release-runbook.md`).
- **Release cadence** — Store builds monthly or on native change; OTA weekly or on demand for JS-only fixes.

---

## 8. Phased roadmap

### Phase 1 — Separate repos, harmonized (now)

- Align **naming**: API prefix pattern, `auth_state` values, env key prefixes (`INTERNAL_MOBILE_*` vs future generic `OPERATOR_MOBILE_*` if renamed).
- Copy **docs only** (this architecture set) into other app repos or link from an internal handbook.
- Add **compatibility matrix** spreadsheet: Laravel version × Expo SDK × shared package version.

### Phase 2 — Extract reusable packages

- First extraction: **`webier/laravel-internal-mobile-auth`** + **`@webier/mobile-auth`** + **`@webier/mobile-api-client`** (smallest vertical slice with clear contract).
- Second: **`webier/laravel-env-discipline`** if `env:doctor` is duplicated.

### Phase 3 — Centralize tooling/workflows

- Shared GitHub Actions / reusable workflows (version matrix check, EAS submit smoke).
- Optional private Composer/npm registry; until then **Composer path repositories** and **git tags** for packages.

### Phase 4 — Operational platform ecosystem

- Unified operator admin patterns (Filament plugins), shared audit event schema, cross-app security dashboard — **only** after Phases 2–3 stabilize.

---

## 9. Risks of premature abstraction

| Risk | Mitigation |
|------|------------|
| Wrong boundary | Extract **after** two apps need it; keep HTTP contract stable first. |
| “God package” | Cap dependencies; split vertical domains only when models match. |
| Version skew | Strict peer dependency ranges and CI matrix. |
| Hidden coupling | Branding and legal strings never go into shared UI packages initially. |

---

## 10. Suggested next practical extraction candidates

1. **HTTP contract doc** — OpenAPI or markdown for `/api/v1/internal-mobile/*` (or versioned successor) including `auth_state`, link-sso, mfa-verify, refresh.
2. **`@webier/mobile-api-client`** — Parameterize `PREFIX` and error parser; ship with tests using `msw`.
3. **`webier/laravel-internal-mobile-auth`** — Move service + routes + models already built for Insuring Income behind a ServiceProvider; app keeps Filament resources thin or moves generic ones into package.
4. **Rename discussion** — If “internal-mobile” is Insuring-Income-specific, define a **neutral** route prefix for the next app while keeping backward compatibility.

---

## Validation constraints (this initiative)

- No production config changes from this doc alone.
- No `.env` secrets; no deploys or pushes required to adopt the strategy.
