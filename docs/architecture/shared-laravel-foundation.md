# Shared Laravel foundation

Companion: [Shared platform strategy](./shared-platform-strategy.md) · [Shared mobile platform](./shared-mobile-platform.md)

This doc describes how to generalize **Insuring Income–style** Laravel patterns into Composer packages for multiple companies (Insuring Income, Meddr, Espressly, Webier) **without** a monorepo migration.

*Note: The authoritative Laravel code for Insuring Income lives in the `insuringincome` repository (sibling to this mobile repo). Items below reflect the architecture described in product docs and the mobile client contract.*

---

## 1. What “shared Laravel” should be

**Strong fit for packages**

- Internal / operator mobile API surface: SSO exchange, refresh, bootstrap, link-sso, mfa-verify.
- SSO identity linking table and model (`user_id`, `provider`, `provider_subject`, `provider_email`, `linked_at`, `last_used_at`).
- Rate limiting + structured JSON errors aligned with the mobile client’s `parseJsonResponse` expectations.
- Audit event writes for security-relevant actions (link, revoke, MFA failure) — **event name schema** shared, storage app-specific if needed.
- Environment key catalog + `env:keys` / `env:doctor` if duplicated across apps.

**Stay in application code initially**

- Domain models (policies, commissions, medical workflows, etc.).
- Filament resources that encode **business** fields — unless two apps share identical CRUD.

**Hybrid**

- Filament **infrastructure** pages (list linked SSO identities, revoke) → can move to package as publishable resources once stable.

---

## 2. Candidate Composer packages (mapped to your list)

| Your name | Suggested package slug | First extraction scope |
|-----------|------------------------|-------------------------|
| **InternalMobileAuth** | `webier/laravel-internal-mobile-auth` | Routes under e.g. `/api/v1/internal-mobile`, services, `auth_state` contract, Fortify MFA gate, token issuance. |
| **DeviceGovernance** | `webier/laravel-device-governance` | Trusted devices, installation hash binding to MFA challenges, session revoke by device. |
| **EnvironmentDiscipline** | `webier/laravel-env-discipline` | Required env manifest + doctor command. |
| **OperationalNotifications** | Defer or thin adapter | Only if push ingestion + DB schema are identical. |
| **OperationalTelemetry** | Defer | Often different sinks (Datadog vs self-hosted). Prefer shared **interface** + local bindings. |
| **AiRuntimeGovernance** | Defer | Highly product-specific. |
| **DocumentIntelligence** | Defer | Extract when OCR/pipeline is literally the same service. |
| **SecureUploads** | Partial | Shared **validation + virus scan hook interface**; storage disk config stays env-driven per app. |
| **RelationshipMemory** | Defer | Domain-specific unless proven shared CRM graph. |
| **WorkflowEngine** | Defer | Only if the same state machine library and tables power two products. |

**Rule of thumb:** merge **InternalMobileAuth** + **DeviceGovernance** into one v1 package if they share migrations and foreign keys tightly; split when a second consumer needs devices without “internal mobile” routes.

---

## 3. API contract (server ↔ shared mobile client)

Stable JSON fields the mobile parsers already expect:

- `auth_state`: `authenticated` | `sso_link_required` | `mfa_required`
- On success: `access_token`, `refresh_token` (names may be generalized in a major version with client bump).
- Linking / MFA: opaque server-issued assertions (`sso_assertion`, `mfa_challenge_id`) — **never** log raw IdP tokens.

Version the HTTP API with prefix (`/api/v1/...`) before renaming to a neutral path; add v2 only with a coordinated mobile major.

---

## 4. Security posture (server)

| Tier | Example controls |
|------|------------------|
| T0 | Dev-only passwords, relaxed throttle |
| T1 | SSO only, optional MFA |
| T2 | MFA required for internal mobile bootstrap; device trust required |
| T3 | T2 + short refresh TTL + aggressive revoke + IP allowlists if applicable |

Implement as **config-driven** checks in the auth service, not `if (company === 'x')` in controllers.

**Hard rules**

- No automatic creation of internal users from SSO alone.
- No raw token logging.
- Rate limit: login, link-sso, mfa-verify, refresh (distinct keys).

---

## 5. Environment governance

- Single **markdown or generated manifest** listing `INTERNAL_MOBILE_*` (or renamed generic keys) with: required?, default, who sets it (Laravel vs EAS vs CI).
- `env:doctor` fails CI when production profile is missing critical keys.
- Mobile-facing doc cross-links Laravel doc (this repo’s README already points at `../insuringincome/docs/env/internal-mobile.md` — keep that pattern per app).

---

## 6. Deployment philosophy (Laravel)

- **Migrations** ship in the package; apps run `vendor:publish` only for config/views if needed — prefer **auto-loaded migrations** in package `ServiceProvider` for zero drift.
- **Config merge** in `register()` with env-backed values.
- **Routes** registered with configurable prefix + middleware group (throttle, `auth:sanctum` or custom guard).

---

## 7. Version policy (Laravel packages)

- Target **one Laravel LTS or current supported minor** per release line of packages.
- Use **semantic versioning**; document Fortify / Sanctum minimum versions in README.
- PHP: declare `require` in `composer.json` explicitly (e.g. `^8.2`).

---

## 8. Extraction order (server)

1. **Migrations + models** for SSO identities and device trust (if not already isolated).
2. **Service class** (`InternalMobileAuthService` pattern) + **controller** with no business imports.
3. **Routes file** + `ServiceProvider`.
4. **Feature tests** packaged as `phpunit` examples or `orchestra/testbench` in package CI.

---

## 9. What stays app-specific

- User model traits / team membership tied to product roles.
- Business policies (what an “operator” can see).
- Notification copy and non-security email templates.

---

## Risks (Laravel-specific)

- **Filament in package** — asset/version conflicts; start with generic **actions** (revoke link) invoked from app resources.
- **Guard / middleware** differences per app — inject contracts (`UserResolver`, `MfaChecker`) from the host app.
