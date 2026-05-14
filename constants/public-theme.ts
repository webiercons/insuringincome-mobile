/**
 * Consumer-facing surfaces — complements internal operator palette.
 * Use `usePublicPalette()` in public routes so light/dark track the system appearance.
 */
export type PublicPalette = {
  canvas: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentMuted: string;
  accentSoft: string;
  hero: string;
  /** Primary text on hero band */
  onHero: string;
  onHeroMuted: string;
  onHeroSubtle: string;
  heroCtaPrimaryBg: string;
  heroCtaPrimaryFg: string;
  heroCtaSecondaryBorder: string;
  heroCtaSecondaryFg: string;
  success: string;
  danger: string;
};

export const publicPaletteLight: PublicPalette = {
  canvas: '#eef2f7',
  surface: '#ffffff',
  text: '#0f172a',
  textMuted: '#475569',
  border: '#dce3ec',
  accent: '#1c3d6b',
  accentMuted: '#3d5a80',
  accentSoft: '#e4eaf4',
  hero: '#0f2850',
  onHero: '#f8fafc',
  onHeroMuted: '#cbd5e1',
  onHeroSubtle: '#94a3b8',
  heroCtaPrimaryBg: '#f8fafc',
  heroCtaPrimaryFg: '#0f2850',
  heroCtaSecondaryBorder: '#64748b',
  heroCtaSecondaryFg: '#e2e8f0',
  success: '#0d6e3e',
  danger: '#b42318',
};

export const publicPaletteDark: PublicPalette = {
  canvas: '#060b14',
  surface: '#0f172a',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#1e293b',
  accent: '#7eb0ea',
  accentMuted: '#9bb9d9',
  accentSoft: '#1a2740',
  hero: '#020617',
  onHero: '#f8fafc',
  onHeroMuted: '#cbd5e1',
  onHeroSubtle: '#94a3b8',
  heroCtaPrimaryBg: '#e2e8f0',
  heroCtaPrimaryFg: '#0f172a',
  heroCtaSecondaryBorder: '#475569',
  heroCtaSecondaryFg: '#e2e8f0',
  success: '#34d399',
  danger: '#fca5a5',
};

/** Frozen light reference for rare non-component contexts (e.g. types). Prefer `usePublicPalette()`. */
export const PublicColors = publicPaletteLight;
