import { useColorScheme } from 'react-native';

import { publicPaletteDark, publicPaletteLight, type PublicPalette } from '@/constants/public-theme';

/**
 * Public consumer routes should use this instead of static `PublicColors`
 * so typography and surfaces respect system light/dark mode.
 */
export function usePublicPalette(): PublicPalette {
  const scheme = useColorScheme();
  return scheme === 'dark' ? publicPaletteDark : publicPaletteLight;
}
