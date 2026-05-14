import { type Href, Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { PublicColors } from '@/constants/public-theme';

const TEAM_LOGIN: Href = '/(auth)/login';

export default function PublicSettingsScreen() {
  const router = useRouter();

  return (
    <PublicScreenShell
      showBack
      title="Settings"
      subtitle="Consumer preferences and how advisors reach this installation.">
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>Advisor & team</Text>
        <Text style={styles.p}>
          Operator tools, CRM-linked workspaces, and device governance use a separate authenticated layer. They are not
          required to browse education or request a quote.
        </Text>
        <Link href={TEAM_LOGIN} asChild>
          <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
            <Text style={styles.ctaTitle}>Advisor / team login</Text>
            <Text style={styles.ctaSub}>Internal access for licensed staff and approved operators</Text>
          </Pressable>
        </Link>
        <Text style={styles.section}>Future: client portal</Text>
        <Text style={styles.p}>
          Policyholders may later sign in to view coverage summaries and service tickets. That experience will live in a
          dedicated client auth flow once product and security review complete.
        </Text>
        <Text style={styles.section}>About this app</Text>
        <Text style={styles.p}>Insuring Income — mobile companion for education, intake, and (when authorized) operator workflows.</Text>
        <Pressable onPress={() => router.push('/(public)/(tabs)')} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
          <Text style={styles.linkText}>Return to home</Text>
        </Pressable>
      </ScrollView>
    </PublicScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: PublicColors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 8,
  },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: PublicColors.textMuted,
    marginBottom: 14,
  },
  cta: {
    backgroundColor: PublicColors.accentSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PublicColors.border,
    padding: 16,
    marginBottom: 20,
  },
  pressed: { opacity: 0.9 },
  ctaTitle: { fontSize: 17, fontWeight: '700', color: PublicColors.accent },
  ctaSub: { marginTop: 6, fontSize: 14, lineHeight: 20, color: PublicColors.textMuted },
  link: { marginTop: 12, paddingVertical: 8 },
  linkText: { fontSize: 16, fontWeight: '600', color: PublicColors.accent },
});
