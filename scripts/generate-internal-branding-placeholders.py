#!/usr/bin/env python3
"""
Regenerate internal-app raster branding placeholders (Insuring Income palette).

Run from repo root:
  python3 scripts/generate-internal-branding-placeholders.py

Replace outputs under assets/images/ with final design-team assets when available;
see docs/branding/native-shell-assets.md for production specs.
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[1]
OUT = REPO / "assets" / "images"

# Align with constants/internal-theme.ts + dark splash shell
NAVY = (28, 61, 107, 255)  # #1c3d6b
NAVY_RGB = (28, 61, 107)
WHITE = (255, 255, 255, 255)
NEAR_WHITE = (232, 238, 246, 255)
MUTED = (180, 196, 220, 255)
SPLASH_BG = (15, 20, 25)  # #0f1419

FONT_CANDIDATES = (
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
)


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_CANDIDATES:
        if os.path.isfile(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def draw_ii_monogram(draw: ImageDraw.ImageDraw, cx: float, cy: float, scale: float) -> None:
    """Abstract double-bar mark (placeholder for official logo)."""
    w = 28 * scale
    h = 120 * scale
    gap = 22 * scale
    r = 8 * scale
    for dx in (-gap / 2 - w / 2, gap / 2 - w / 2):
        x0, y0 = cx + dx - w / 2, cy - h / 2
        x1, y1 = cx + dx + w / 2, cy + h / 2
        draw.rounded_rectangle((x0, y0, x1, y1), radius=r, fill=WHITE)


def save_rgba(path: Path, im: Image.Image) -> None:
    im.save(path, "PNG", optimize=True)


def save_rgb_no_alpha(path: Path, im_rgba: Image.Image) -> None:
    bg = Image.new("RGB", im_rgba.size, NAVY_RGB)
    bg.paste(im_rgba, mask=im_rgba.split()[3])
    bg.save(path, "PNG", optimize=True)


def icon_1024() -> Image.Image:
    size = 1024
    im = Image.new("RGBA", (size, size), NAVY)
    draw = ImageDraw.Draw(im)
    cx, cy = size / 2, size / 2
    draw_ii_monogram(draw, cx, cy, scale=4.2)
    return im


def splash_logo() -> Image.Image:
    """Wide transparent wordmark for dark splash (scaled by expo-splash-screen)."""
    w, h = 1120, 360
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    title = load_font(86)
    subtitle = load_font(34)
    tw, th = draw.textbbox((0, 0), "Insuring Income", font=title)[2:]
    sw, sh = draw.textbbox((0, 0), "Internal operations", font=subtitle)[2:]
    tx = (w - tw) / 2
    ty = (h - th - sh - 18) / 2
    draw.text((tx, ty), "Insuring Income", font=title, fill=NEAR_WHITE)
    sx = (w - sw) / 2
    draw.text((sx, ty + th + 18), "Internal operations", font=subtitle, fill=MUTED)
    return im


def favicon() -> Image.Image:
    s = 48
    im = Image.new("RGBA", (s, s), NAVY)
    draw = ImageDraw.Draw(im)
    draw_ii_monogram(draw, s / 2, s / 2, scale=0.22)
    return im


def android_monochrome() -> Image.Image:
    """432×432 adaptive monochrome layer (white on transparent)."""
    s = 432
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    draw_ii_monogram(draw, s / 2, s / 2, scale=1.65)
    return im


def android_foreground() -> Image.Image:
    s = 1024
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    draw_ii_monogram(draw, s / 2, s / 2, scale=4.0)
    return im


def android_background() -> Image.Image:
    s = 1024
    return Image.new("RGBA", (s, s), NAVY)


def notification_icon() -> Image.Image:
    """Android status bar: white glyph on transparent."""
    s = 256
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    draw_ii_monogram(draw, s / 2, s / 2, scale=0.95)
    # Flatten to pure white for notification silhouette
    px = im.load()
    assert px is not None
    for y in range(s):
        for x in range(s):
            r, g, b, a = px[x, y]
            if a > 0:
                px[x, y] = (255, 255, 255, a)
    return im


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    icon = icon_1024()
    save_rgb_no_alpha(OUT / "icon.png", icon)

    save_rgba(OUT / "favicon.png", favicon())
    save_rgba(OUT / "splash-logo.png", splash_logo())
    save_rgba(OUT / "android-icon-foreground.png", android_foreground())
    save_rgba(OUT / "android-icon-background.png", android_background())
    save_rgba(OUT / "android-icon-monochrome.png", android_monochrome())
    save_rgba(OUT / "notification-icon.png", notification_icon())

    print("Wrote:", ", ".join(sorted(p.name for p in OUT.glob("*.png"))))


if __name__ == "__main__":
    main()
