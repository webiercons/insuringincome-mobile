import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { publicCardShadow, PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';

export default function AccountHubScreen() {
  const router = useRouter();
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <PublicScreenShell
      title="Account"
      subtitle="Document preparation, scheduling requests, and preferences — consumer surface only.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Operator sign-in lives on a separate route and never mixes with these consumer tools. Nothing here accesses
          privileged CRM or underwriting systems.
        </Text>
        <NavTile
          palette={palette}
          title="Upload documents"
          body="Stage files and notes for your advisor. Secure server intake is not enabled in this build."
          onPress={() => router.push('/(public)/(tabs)/account/upload-documents')}
        />
        <NavTile
          palette={palette}
          title="Contact & schedule"
          body="Request a consultation or callback — submission stays on-device until public APIs connect."
          onPress={() => router.push('/(public)/(tabs)/account/contact')}
        />
        <NavTile
          palette={palette}
          title="Settings"
          body="About this app, future client portal notes, and advisor entry — all in one place."
          onPress={() => router.push('/(public)/(tabs)/account/settings')}
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
  tileTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  tileBody: { marginTop: 8, fontSize: 14, lineHeight: 21 },
  tileLink: { marginTop: 12, fontSize: 15, fontWeight: '700' },
});

function createStyles(p: ReturnType<typeof usePublicPalette>) {
  return StyleSheet.create({
    scroll: { paddingBottom: 32 },
    intro: {
      fontSize: 15,
      lineHeight: 23,
      color: p.text,
      marginBottom: PublicLayout.gapLg,
    },
  });
}
