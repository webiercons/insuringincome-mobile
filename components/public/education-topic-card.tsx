import { StyleSheet, Text, View } from 'react-native';

import { publicCardShadow, PublicLayout } from '@/constants/public-layout';
import type { PublicPalette } from '@/constants/public-theme';

type Props = {
  palette: PublicPalette;
  lens: string;
  title: string;
  body: string;
};

export function EducationTopicCard({ palette, lens, title, body }: Props) {
  return (
    <View
      style={[
        styles.card,
        publicCardShadow,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}>
      <Text style={[styles.lens, { color: palette.accent }]}>{lens}</Text>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.body, { color: palette.textMuted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: PublicLayout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: PublicLayout.cardPadding,
    marginBottom: PublicLayout.gapMd,
  },
  lens: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
  },
});
