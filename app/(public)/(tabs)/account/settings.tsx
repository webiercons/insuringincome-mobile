import { type Href, Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { TrustFootnote } from '@/components/public/trust-footnote';
import { publicCardShadow, PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';

const TEAM_LOGIN: Href = '/(auth)/login';

export default function PublicSettingsScreen() {
  const router = useRouter();
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <PublicScreenShell
      showBack
      title="Settings"
      subtitle="Consumer preferences — separate from authenticated operator tools.">
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>Advisor access</Text>
        <Text style={styles.p}>
          Licensed staff and approved operators use a hardened sign-in flow with device governance. It is never mixed
          with public education or intake on this tab.
        </Text>
        <Link href={TEAM_LOGIN} asChild>
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              publicCardShadow,
              { borderColor: palette.border, backgroundColor: palette.accentSoft, opacity: pressed ? 0.92 : 1 },
            ]}>
            <Text style={[styles.ctaTitle, { color: palette.accent }]}>Advisor / team sign-in</Text>
            <Text style={[styles.ctaSub, { color: palette.textMuted }]}>
              Internal tools only — not required for quotes or resources
            </Text>
          </Pressable>
        </Link>

        <Text style={styles.section}>Future: policyholder portal</Text>
        <Text style={styles.p}>
          A dedicated client experience for coverage summaries and service tickets may arrive after security review.
          This public shell will link there without reusing operator authentication.
        </Text>

        <Text style={styles.section}>About Insuring Income</Text>
        <Text style={styles.p}>
          Mobile companion for physician-oriented education, disciplined intake drafts, and (when authorized) operator
          workflows. Brand and advisory standards are independent of third-party starter templates.
        </Text>

        <TrustFootnote palette={palette}>
          App version and update diagnostics appear only after advisor sign-in — consumer settings stay lightweight.
        </TrustFootnote>

        <Pressable onPress={() => router.push('/(public)/(tabs)')} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
          <Text style={[styles.linkText, { color: palette.accent }]}>Return to home</Text>
        </Pressable>
      </ScrollView>
    </PublicScreenShell>
  );
}

function createStyles(p: ReturnType<typeof usePublicPalette>) {
  return StyleSheet.create({
    scroll: { paddingBottom: 40 },
    section: {
      fontSize: 12,
      fontWeight: '800',
      color: p.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.75,
      marginTop: 8,
      marginBottom: 10,
    },
    p: {
      fontSize: 15,
      lineHeight: 23,
      color: p.textMuted,
      marginBottom: 16,
    },
    cta: {
      borderRadius: PublicLayout.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      padding: PublicLayout.cardPadding,
      marginBottom: 22,
    },
    pressed: { opacity: 0.9 },
    ctaTitle: { fontSize: 17, fontWeight: '800' },
    ctaSub: { marginTop: 8, fontSize: 14, lineHeight: 21 },
    link: { marginTop: 12, paddingVertical: 8 },
    linkText: { fontSize: 16, fontWeight: '700' },
  });
}
