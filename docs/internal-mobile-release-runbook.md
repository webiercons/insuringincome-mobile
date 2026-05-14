# Internal mobile — release & OTA runbook

Operational guide for **EAS Build**, **EAS Submit**, and **EAS Update** (OTA) for the Insuring Income internal app.

## Branch / channel map

| Git branch (recommended) | EAS Update **channel** | Typical **EAS Build** profile |
|----------------------------|-------------------------|-------------------------------|
| `preview` | `preview` | `preview` (internal distribution) |
| `testflight` | `testflight` | `testflight` (store / TestFlight) |
| `production` | `production` | `production` (store) |
| `development` | `development` | `development` (dev client) |

Publishing OTA updates should use **matching branch + channel** names to avoid mistakes:

```bash
eas update --branch preview --channel preview --message "Your summary"
```

## New native binary (TestFlight / store)

When you change anything **native-build-required** (see `docs/internal-mobile-dependency-roadmap.md`):

```bash
eas build --platform ios --profile testflight
# After QA:
eas submit --platform ios --profile testflight --latest
```

Bump **`expo.version`** in `app.config.ts` when you intentionally cut a new **runtime** line for OTA (with `runtimeVersion: { policy: 'appVersion' }`, OTAs only apply to binaries with that same version).

## Publish OTA (no native change)

**Preview / internal QA**

```bash
eas update --branch preview --channel preview --message "Describe the change"
```

(`eas.json` does not use a separate `update` block in this repo; channels come from `build.*.channel` and must match the arguments to `eas update`.)

**TestFlight testers (same `expo.version` as their installed build)**

```bash
eas update --branch testflight --channel testflight --message "Describe the change"
```

**Production store users**

```bash
eas update --branch production --channel production --message "Describe the change"
```

npm scripts in `package.json` wrap the same (`npm run ota:preview`, etc.).

## Inspect update status

```bash
eas channel:list
eas branch:list
eas update:list --branch testflight --limit 20
```

Use the Expo dashboard **Deploy → Updates** for visual history and diffs.

## Rollback / republish

- **Rollback** (re-point channel to a prior update): use Expo dashboard or `eas update:rollback` (see current EAS CLI help; flags evolve).  
- **Republish known-good**: republish a previous update ID if your team uses that workflow, or publish a revert commit as a new update on the same channel.

Always confirm **`runtimeVersion`** compatibility before rollback.

## In-app behavior

- **Settings → Diagnostics** shows EAS Update channel, runtime, and update id (when enabled).  
- **Check for OTA update** runs `expo-updates` check/fetch; reload is **user-confirmed** to avoid interrupting operators mid-task.

## Secrets

- Never put APNs keys or Google services JSON in the repo.  
- Use **EAS Secrets** / CI variables for credentials referenced by `eas build`.  
- Push tokens are device identifiers — treat as sensitive in logs; Laravel ingestion should hash or store securely per existing internal-mobile device model.
