import { Platform, type ViewStyle } from 'react-native';

/** Consistent radii / spacing for public surfaces (mobile-first). */
export const PublicLayout = {
  screenPaddingX: 20,
  sectionGap: 22,
  cardRadius: 16,
  cardPadding: 18,
  inputRadius: 14,
  gapSm: 10,
  gapMd: 14,
  gapLg: 20,
} as const;

/** Restrained elevation for cards — premium, not flashy. */
export const publicCardShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  default: {
    elevation: 2,
  },
});
