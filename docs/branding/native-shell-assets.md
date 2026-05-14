# Native shell branding — Insuring Income (internal mobile)

Raster assets in `assets/images/` referenced from `app.config.ts` and config plugins define what operators see **before** JavaScript loads: home-screen icon, splash, favicon (web export), Android adaptive layers, and the Android notification glyph.

## Current placeholders

The repo ships **generated placeholders** (Insuring Income palette, abstract mark + wordmark). Regenerate after palette tweaks:

```bash
python3 scripts/generate-internal-branding-placeholders.py
```

Replace these files with **final design exports** before a broad external rollout. Keep filenames stable so `app.config.ts` does not need churn.

## File → role (as wired today)

| File | Role |
|------|------|
| `icon.png` | iOS App Store icon source; general Expo app icon. |
| `favicon.png` | Web static export favicon. |
| `splash-logo.png` | Centered splash image (`expo-splash-screen`); background `#0f1419` in config. |
| `android-icon-foreground.png` | Adaptive icon foreground (transparent canvas, logo centered in safe zone). |
| `android-icon-background.png` | Adaptive icon background (flat brand field). |
| `android-icon-monochrome.png` | Android themed / monochrome adaptive layer (white-on-transparent silhouette). |
| `notification-icon.png` | Android notification icon (white + alpha only; no color). |

## Production export specifications

### iOS — App Store icon (`icon.png`)

- **1024 × 1024 px**, **PNG**, **sRGB**.
- **No transparency** (App Store Connect rejects alpha on the marketing icon).
- No rounded corners in the file; Apple applies mask.

### Android — adaptive icon

- **Foreground and background: 1024 × 1024 px** PNG recommended (Play and Expo tooling resize).
- **Foreground:** key artwork in the **center ~66%** “safe” circle; outer margin avoids clipping on OEM masks.
- **Background:** flat color or subtle texture without critical detail at edges.
- **Monochrome:** **432 × 432 px** (Expo default generation size) PNG, **white** artwork on **transparent** background for themed launcher icons.

### Splash (`splash-logo.png`)

- Wide **transparent** PNG with logo / wordmark intended for **dark** `#0f1419` backdrop.
- Practical range: **~900–1200 px width**, **~240–400 px height** at 3× logical density; keep file size reasonable.
- `app.config.ts` sets `imageWidth` (logical points) and `resizeMode: 'contain'`.

### Web favicon (`favicon.png`)

- Minimum **48 × 48 px** PNG (Expo / router static export). For crisp browser chrome, design teams often supply **192 × 192** and **512 × 512** later; today the config uses a single `favicon.png`.

### Android notification icon (`notification-icon.png`)

- **White silhouette + transparency only** (Android tints it); no color fills.
- Typical source: **96–256 px** square PNG; keep shapes bold for small sizes.

## OTA vs TestFlight

| Change | Delivery |
|--------|----------|
| In-app UI, copy, JS `Image` sources under `assets/` not used by native plugins | **EAS Update** (same `runtimeVersion` / channel). |
| `icon.png`, splash plugin image, adaptive layers, `notification-icon.png`, `favicon.png`, `CFBundleDisplayName`, plugin config | **New native binary** → TestFlight / store. |

When in doubt, treat any `app.config.ts` **plugin** or **icon** path change as **rebuild required** (see `docs/internal-mobile-dependency-roadmap.md`).
