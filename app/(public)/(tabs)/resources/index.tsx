import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { publicCardShadow, PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';

export default function ResourcesHubScreen() {
  const router = useRouter();
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <PublicScreenShell
      title="Resources"
      subtitle="Structured education for physicians and professionals — no account required.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Short reads you can finish between cases. Deeper illustrations and pricing stay with your licensed advisor.
        </Text>

        <Text style={styles.groupLabel}>Foundations</Text>
        <NavTile
          palette={palette}
          title="Learn"
          body="Why coverage exists, disability vs. life, and how advisor review fits your timeline."
          onPress={() => router.push('/(public)/(tabs)/resources/learn')}
        />

        <Text style={styles.groupLabel}>Income protection</Text>
        <NavTile
          palette={palette}
          title="Disability insurance"
          body="Clinical income risk, contract definitions, and underwriting realism."
          onPress={() => router.push('/(public)/(tabs)/resources/disability-insurance')}
        />

        <Text style={styles.groupLabel}>Life & legacy</Text>
        <NavTile
          palette={palette}
          title="Life insurance"
          body="Term structure, permanent overview, and beneficiary governance."
          onPress={() => router.push('/(public)/(tabs)/resources/life-insurance')}
        />
      </ScrollView>
    </PublicScreenShell>
  );
}

function NavTile({
  palette,
  title,
  body,
  onPress,
}: {
  palette: ReturnType<typeof usePublicPalette>;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        tileStyles.tile,
        publicCardShadow,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}>
      <Text style={[tileStyles.tileTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[tileStyles.tileBody, { color: palette.textMuted }]}>{body}</Text>
      <Text style={[tileStyles.tileLink, { color: palette.accent }]}>Open ›</Text>
    </Pressable>
  );
}

const tileStyles = StyleSheet.create({
  tile: {
    borderRadius: PublicLayout.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: PublicLayout.cardPadding,
    marginBottom: PublicLayout.gapMd,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tileBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  tileLink: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '700',
  },
});

function createStyles(p: ReturnType<typeof usePublicPalette>) {
  return StyleSheet.create({
    scroll: {
      paddingBottom: 36,
    },
    intro: {
      fontSize: 15,
      lineHeight: 23,
      color: p.text,
      marginBottom: PublicLayout.gapLg,
    },
    groupLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: p.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.75,
      marginBottom: 10,
      marginTop: 4,
    },
  });
}
