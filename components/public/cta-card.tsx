import { useMemo } from 'react';
import { type Href, Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { publicCardShadow, PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';

type CtaCardProps = {
  title: string;
  description: string;
  href: Href;
  /** Primary row actions (e.g. quote) */
  emphasis?: boolean;
};

export function CtaCard({ title, description, href, emphasis }: CtaCardProps) {
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette, !!emphasis), [palette, emphasis]);

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.card, publicCardShadow, pressed && styles.pressed]}>
        <View style={styles.row}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function createStyles(p: ReturnType<typeof usePublicPalette>, emphasis: boolean) {
  const border = emphasis ? p.accent : p.border;
  const bg = emphasis ? p.accentSoft : p.surface;
  return StyleSheet.create({
    card: {
      backgroundColor: bg,
      borderRadius: PublicLayout.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: border,
      paddingVertical: PublicLayout.cardPadding,
      paddingHorizontal: PublicLayout.cardPadding,
      marginBottom: PublicLayout.gapMd,
    },
    pressed: {
      opacity: 0.92,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    textBlock: {
      flex: 1,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: p.text,
      letterSpacing: -0.15,
    },
    description: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 21,
      color: p.textMuted,
    },
    chevron: {
      fontSize: 22,
      fontWeight: '300',
      color: p.accentMuted,
    },
  });
}
