import { ScrollView, StyleSheet, Text } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { PublicColors } from '@/constants/public-theme';

export default function LifeInsuranceScreen() {
  return (
    <PublicScreenShell showBack title="Life insurance" subtitle="Death benefit design for people who depend on you.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Life insurance answers whether survivors can service debt, replace income, fund education, and keep a business
          stable if you die unexpectedly. Term covers a defined period; permanent adds cash-value mechanics and longer
          duration guarantees—each suits different planning outcomes.
        </Text>
        <Section
          k="Term structure"
          p="Level term locks premium and death benefit for a window (often 10–30 years). Conversion privileges may let you move to permanent coverage without new medical evidence."
        />
        <Section
          k="Permanent overview"
          p="Whole life, universal life, and indexed products differ in premium flexibility, crediting, and guarantees. Illustrations are not promises—review nonguaranteed elements with your advisor."
        />
        <Section
          k="Beneficiary discipline"
          p="Keep beneficiary designations aligned with estate documents and business agreements. Major life events should trigger a review with counsel when appropriate."
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
  scroll: { paddingBottom: 40 },
  lead: {
    fontSize: 15,
    lineHeight: 23,
    color: PublicColors.text,
    marginBottom: 8,
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
