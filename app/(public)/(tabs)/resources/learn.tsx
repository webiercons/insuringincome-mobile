import { ScrollView, StyleSheet, Text } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { PublicColors } from '@/constants/public-theme';

export default function LearnScreen() {
  return (
    <PublicScreenShell showBack title="Learn" subtitle="Plain-language foundations for confident decisions.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Section k="Why coverage exists" p="Insurance transfers catastrophic financial risk you cannot self-fund to a carrier contractually obligated to pay when defined events occur." />
        <Section
          k="Disability vs life"
          p="Disability insurance protects your ability to earn. Life insurance protects others from the economic loss of your death. Many households need both, in different amounts."
        />
        <Section
          k="Working with an advisor"
          p="Carriers and product shelves vary by state. A licensed advisor helps you compare illustrations, definitions, and riders rather than choosing from marketing pages alone."
        />
        <Section
          k="Next step"
          p="When you are ready, use Quote to outline your goals or Contact to schedule a consultation. Nothing here requires sign-in."
        />
      </ScrollView>
    </PublicScreenShell>
  );
}

function Section({ k, p }: { k: string; p: string }) {
  return (
    <>
      <Text style={styles.h}>{k}</Text>
      <Text style={styles.p}>{p}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
    gap: 0,
  },
  h: {
    fontSize: 17,
    fontWeight: '700',
    color: PublicColors.text,
    marginTop: 18,
    marginBottom: 8,
  },
  p: {
    fontSize: 15,
    lineHeight: 23,
    color: PublicColors.textMuted,
  },
});
