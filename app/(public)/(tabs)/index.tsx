import { type Href, Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CtaCard } from '@/components/public/cta-card';
import { PublicColors } from '@/constants/public-theme';

const TEAM_LOGIN: Href = '/(auth)/login';

export default function PublicHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.brand}>Insuring Income</Text>
        <Text style={styles.tagline}>Protect income. Plan for life. Work with advisors you trust.</Text>
        <Text style={styles.heroBody}>
          Explore coverage types, request a quote outline, or reach our team — all without signing in. Licensed staff use
          separate operator tools after authentication.
        </Text>
        <View style={styles.heroActions}>
          <Pressable
            onPress={() => router.push('/(public)/(tabs)/quote-request')}
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
            <Text style={styles.primaryLabel}>Request a quote</Text>
          </Pressable>
          <Link href={TEAM_LOGIN} asChild>
            <Pressable style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
              <Text style={styles.secondaryLabel}>Advisor / team login</Text>
            </Pressable>
          </Link>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Get started</Text>
        <CtaCard
          title="Explore education & products"
          description="Learn core concepts, then compare disability and life insurance at a high level."
          href="/(public)/(tabs)/resources"
        />
        <CtaCard
          title="Quote request"
          description="Share goals and contact preferences — intake deepens when our public API is enabled."
          href="/(public)/(tabs)/quote-request"
        />
        <CtaCard
          title="Upload documents"
          description="Prepare files for underwriting or service when your advisor confirms intake."
          href="/(public)/(tabs)/account/upload-documents"
        />
        <CtaCard
          title="Contact & schedule"
          description="Request a consultation or callback from our team."
          href="/(public)/(tabs)/account/contact"
        />
        <CtaCard title="Account & settings" description="Preferences, notifications, and advisor access." href="/(public)/(tabs)/account/settings" />
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PublicColors.canvas },
  root: {
    flex: 1,
    backgroundColor: PublicColors.canvas,
  },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: PublicColors.hero,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  heroBody: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#94a3b8',
  },
  heroActions: {
    marginTop: 20,
    gap: 10,
  },
  primary: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondary: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: 'transparent',
  },
  pressed: { opacity: 0.88 },
  primaryLabel: { fontSize: 16, fontWeight: '700', color: PublicColors.hero },
  secondaryLabel: { fontSize: 16, fontWeight: '600', color: '#e2e8f0' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: PublicColors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
});
