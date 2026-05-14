import { StyleSheet, Text, View } from 'react-native';

import type { PublicPalette } from '@/constants/public-theme';

type Props = {
  palette: PublicPalette;
  children: string;
};

/** Subtle credibility / compliance line — use sparingly. */
export function TrustFootnote({ palette, children }: Props) {
  return (
    <View style={[styles.wrap, { borderTopColor: palette.border }]}>
      <Text style={[styles.text, { color: palette.textMuted }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
  },
});
