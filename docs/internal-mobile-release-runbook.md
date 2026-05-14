# Internal mobile — release & OTA runbook

Operational guide for **EAS Build**, **EAS Submit**, and **EAS Update** (OTA) for the Insuring Income internal app.

The app sets **`updates.checkAutomatically` to `NEVER`** in `app.config.ts`: operators **manually** check for updates from **Settings** so nothing downloads or reloads during sensitive work without explicit confirmation.

Cold start sends signed-out users to the **public** tab shell (`/(public)/(tabs)`). Signed-in operators with approved devices land in **`/(internal)/(tabs)`** (see `app/index.tsx`).

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

## EAS build profiles & operator API URL

`eas.json` sets **`EXPO_PUBLIC_API_BASE_URL=https://app.insuringincome.com`** for **`preview`**, **`testflight`**, and **`production`** profiles so TestFlight and internal distribution builds call the live Laravel API without baking secrets.

**`development`** does **not** set the URL: use `.env` locally (see `.env.example`).

Override per profile only when intentionally pointing a build at staging.

## New native binary (TestFlight / store)

Use this flow for the **first real operator authentication test** and every native-affecting change.

When you change anything **native-build-required** (see `docs/internal-mobile-dependency-roadmap.md`):

```bash
eas build --platform ios --profile testflight
# After QA:
eas submit --platform ios --profile testflight --latest
```

After the first TestFlight build is in App Store Connect, confirm **Sign in with Apple** is enabled on the App ID for `com.insuringincome.internal.app`, and that **Google OAuth client IDs** (if used) are supplied via EAS env or secrets for that profile.

Bump **`expo.version`** in `app.config.ts` when you intentionally cut a new **runtime** line for OTA (with `runtimeVersion: { policy: 'appVersion' }`, OTAs only apply to binaries with that same version).

### App Store export compliance (ITSAppUsesNonExemptEncryption)

`app.config.ts` sets **`ios.config.usesNonExemptEncryption: false`**, which maps to **`ITSAppUsesNonExemptEncryption = NO`** in the iOS `Info.plist`. That tells App Store Connect the app uses **only exempt encryption** (for example HTTPS/TLS and standard Apple or Expo-provided APIs), so Connect is less likely to **re-prompt** for the same export-compliance questionnaire on every TestFlight or App Store submission.

This matches the current app: **HTTPS only**, no proprietary crypto. **If a future feature adds non-exempt encryption** (custom crypto, specialized tunneling beyond normal TLS, or other categories your counsel flags), update this declaration and complete any required compliance steps before shipping.

### Native shell branding (icons, splash, notification icon)

Changes under `assets/images/` that feed **`app.config.ts`** (`icon`, `web.favicon`, `android.adaptiveIcon`, **`expo-splash-screen`**, **`expo-notifications`**) are **native-build-required**: cut a **new EAS iOS build** and distribute via TestFlight before operators see them. OTA can still refresh in-app UI and JS-loaded images, but the store icon, launch splash, and Android notification glyph ship with the binary.

Regenerate committed **palette-based** rasters with `python3 scripts/generate-internal-branding-placeholders.py` after visual tweaks. Replace with final marketing exports **keeping the same filenames** so `app.config.ts` stays stable — see dimensions in `docs/branding/native-shell-assets.md`.

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
