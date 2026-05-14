# Insuring Income — Internal Mobile (Expo)

Internal-only authenticated iPhone app for operators. Ships with **EAS Build / EAS Submit** to **TestFlight**, with **EAS Update** for JavaScript OTA on matching channels.

## Prerequisites

- Node.js and npm (this repo uses npm / `package-lock.json`).
- Expo account and [EAS CLI](https://docs.expo.dev/build/setup/) logged in (`eas login`).
- Apple Developer Program access and an App Store Connect app record for the iOS bundle identifier.

## Configuration

1. Copy `.env.example` to `.env` for local development.
2. Set `EXPO_PUBLIC_API_BASE_URL` to your **deployed** Laravel API origin (HTTPS, no secrets in git).
3. Configure **Google** client IDs (`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`) so operators can use **Continue with Google**. Apple sign-in uses the system button on iOS with your bundle ID (enable the capability in Apple Developer / App Store Connect).
4. Internal mobile auth calls Laravel at **`/api/v1/internal-mobile/*`**: Google / Apple (or optional password when `EXPO_PUBLIC_INTERNAL_MOBILE_PASSWORD_AUTH_ENABLED=true` **and** the server enables `INTERNAL_MOBILE_PASSWORD_AUTH_ENABLED`), then refresh and bootstrap. Access and refresh tokens are stored in **Expo SecureStore** (not AsyncStorage).
5. New devices can remain in a **pending approval** state until a super admin approves them in the operator Filament UI; the app shows a dedicated screen until access unlocks.

See `../insuringincome/docs/env/internal-mobile.md` for the matching Laravel `INTERNAL_MOBILE_*` environment keys.

## Local development

```bash
npm install
cp .env.example .env
# edit .env with your deployed API base URL
npm run start
```

Use the iOS simulator or a device; the app does not target localhost/Herd for production workflows.

```bash
npm run lint
npm run typecheck
```

## EAS Build profiles (`eas.json`)

| Profile        | Purpose                                      | EAS Update channel |
|----------------|----------------------------------------------|--------------------|
| `development`  | Dev client, internal distribution            | `development`      |
| `preview`      | Internal distribution (no TestFlight)      | `preview`          |
| `testflight`   | App Store / TestFlight binary                | `testflight`       |
| `production`   | Reserved store-ready release (manual use)  | `production`       |

Bundle identifiers are placeholders in `app.config.ts` (`com.insuringincome.internal.app`). Update them to your Apple-registered IDs before shipping.

## TestFlight build

Configure iOS credentials and bundle ID in Expo / Apple portals, then:

```bash
eas build --platform ios --profile testflight
```

Do **not** commit signing secrets; use EAS credentials and environment variables in the Expo dashboard when needed.

## TestFlight submit

After a successful build:

```bash
eas submit --platform ios --profile testflight --latest
```

Submit only when you intend to; this repo does not automate submission.

## OTA updates (EAS Update)

- `runtimeVersion` uses the **`appVersion` policy** (see `app.config.ts`), so OTA payloads apply only to binaries with the same `expo.version`.
- Each build profile sets a **channel** (`preview`, `testflight`, `production`, `development`) in `eas.json`.
- Publishing an update (example — run only when you explicitly want to publish):

  ```bash
  eas update --channel testflight --message "Describe the change"
  ```

This workspace does not run publish/submit commands unless you ask.

## Native rebuild warning

If you change native code, permissions, plugins, `runtimeVersion` policy, or anything that alters the native project, you **must** create a new EAS build. OTA updates cannot replace native changes.

## Apple Developer / App Store Connect checklist

- [ ] Register the bundle identifier in the Apple Developer portal (matches `ios.bundleIdentifier` in `app.config.ts`).
- [ ] Create an App Store Connect app with the same bundle ID.
- [ ] Enable TestFlight for the bundle; complete export compliance and beta review requirements as needed.
- [ ] Generate or link signing certificates and provisioning profiles (EAS can manage this).
- [ ] Add internal testers and distribution groups in App Store Connect.
- [ ] Store API keys and Apple credentials outside the repo (EAS Secrets / CI variables).

## Security notes

- Access and refresh tokens live in **Expo Secure Store** (iOS keychain / Android Keystore-backed secure storage), not AsyncStorage.
- **401** responses from authenticated `apiRequest` calls attempt one **refresh-token rotation**, then clear storage and return operators to the login screen. **403** is treated as authorization or feature gating (for example a pending device) and does **not** automatically sign the user out.
- No secrets belong in git; use `.env` locally and EAS environment variables for cloud builds.
