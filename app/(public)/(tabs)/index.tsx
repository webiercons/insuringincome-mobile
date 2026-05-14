import { type Href, Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CtaCard } from '@/components/public/cta-card';
import { TrustFootnote } from '@/components/public/trust-footnote';
import { PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';

const TEAM_LOGIN: Href = '/(auth)/login';

export default function PublicHomeScreen() {
  const router = useRouter();
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Insuring Income</Text>
          <Text style={styles.headline}>Income protection for physicians & professionals</Text>
          <Text style={styles.tagline}>
            Education-first guidance, disciplined underwriting language, and advisor-led decisions — before you bind.
          </Text>
          <View style={styles.trustRow}>
            <Text style={styles.trustChip}>Licensed advisors</Text>
            <Text style={styles.trustDot}>·</Text>
            <Text style={styles.trustChip}>State-specific offers</Text>
            <Text style={styles.trustDot}>·</Text>
            <Text style={styles.trustChip}>No login to browse</Text>
          </View>
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.push('/(public)/(tabs)/quote-request')}
              style={({ pressed }) => [styles.primaryCta, pressed && styles.pressed]}>
              <Text style={styles.primaryCtaLabel}>Start a quote outline</Text>
              <Text style={styles.primaryCtaHint}>Local draft — your advisor finalizes</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(public)/(tabs)/account/upload-documents')}
              style={({ pressed }) => [styles.secondaryCta, pressed && styles.pressed]}>
              <Text style={styles.secondaryCtaLabel}>Prepare documents</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(public)/(tabs)/account/contact')}
              style={({ pressed }) => [styles.secondaryCta, pressed && styles.pressed]}>
              <Text style={styles.secondaryCtaLabel}>Schedule a consultation</Text>
            </Pressable>
            <Link href={TEAM_LOGIN} asChild>
              <Pressable style={({ pressed }) => [styles.advisorLink, pressed && styles.pressed]}>
                <Text style={styles.advisorLinkLabel}>Advisor / team sign-in</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Protection focus</Text>
          <View style={styles.pillarRow}>
            <View style={[styles.pillar, { borderColor: palette.border, backgroundColor: palette.surface }]}>
              <Text style={styles.pillarTitle}>Disability</Text>
              <Text style={styles.pillarBody}>Paycheck protection when illness or injury interrupts your practice.</Text>
            </View>
            <View style={[styles.pillar, { borderColor: palette.border, backgroundColor: palette.surface }]}>
              <Text style={styles.pillarTitle}>Life</Text>
              <Text style={styles.pillarBody}>Survivorship liquidity for debt, education, and succession plans.</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Continue</Text>
          <CtaCard
            emphasis
            title="Structured resources"
            description="Foundations, disability contract language, and life design — written for busy clinicians."
            href="/(public)/(tabs)/resources"
          />
          <CtaCard
            title="Quote outline"
            description="A staged intake that mirrors how underwriting actually starts — saved on-device until APIs connect."
            href="/(public)/(tabs)/quote-request"
          />
          <CtaCard
            title="Secure document handling"
            description="Choose files and add context for your advisor. Transmission is not enabled in this build."
            href="/(public)/(tabs)/account/upload-documents"
          />
          <CtaCard
            title="Account hub"
            description="Contact preferences, document prep, and consumer settings — separate from operator tools."
            href="/(public)/(tabs)/account"
          />

          <TrustFootnote palette={palette}>
            Insuring Income is an insurance and advisory brand. Product availability and illustrations vary by state;
            nothing in this app is an offer, contract, or tax advice.
          </TrustFootnote>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function createStyles(p: ReturnType<typeof usePublicPalette>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: p.canvas },
    root: { flex: 1, backgroundColor: p.canvas },
    hero: {
      paddingHorizontal: PublicLayout.screenPaddingX + 2,
      paddingTop: 18,
      paddingBottom: 22,
      backgroundColor: p.hero,
    },
    brand: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: p.onHeroSubtle,
    },
    headline: {
      marginTop: 10,
      fontSize: 26,
      fontWeight: '800',
      lineHeight: 32,
      color: p.onHero,
      letterSpacing: -0.5,
    },
    tagline: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 22,
      color: p.onHeroMuted,
    },
    trustRow: {
      marginTop: 16,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 4,
    },
    trustChip: {
      fontSize: 12,
      fontWeight: '600',
      color: p.onHeroSubtle,
    },
    trustDot: {
      fontSize: 12,
      color: p.onHeroSubtle,
      opacity: 0.7,
    },
    heroActions: {
      marginTop: 22,
      gap: 10,
    },
    primaryCta: {
      backgroundColor: p.heroCtaPrimaryBg,
      borderRadius: PublicLayout.cardRadius,
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    primaryCtaLabel: {
      fontSize: 17,
      fontWeight: '800',
      color: p.heroCtaPrimaryFg,
      letterSpacing: -0.2,
    },
    primaryCtaHint: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '600',
      color: p.textMuted,
    },
    secondaryCta: {
      borderRadius: PublicLayout.cardRadius,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: p.heroCtaSecondaryBorder,
    },
    secondaryCtaLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: p.heroCtaSecondaryFg,
    },
    advisorLink: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    advisorLinkLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: p.onHeroMuted,
      textDecorationLine: 'underline',
    },
    pressed: { opacity: 0.9 },
    scroll: {
      paddingHorizontal: PublicLayout.screenPaddingX,
      paddingTop: PublicLayout.sectionGap,
      paddingBottom: 40,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '800',
      color: p.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.75,
      marginBottom: 12,
    },
    pillarRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: PublicLayout.sectionGap,
    },
    pillar: {
      flex: 1,
      borderRadius: PublicLayout.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 14,
    },
    pillarTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: p.text,
      marginBottom: 6,
    },
    pillarBody: {
      fontSize: 13,
      lineHeight: 19,
      color: p.textMuted,
    },
  });
}
