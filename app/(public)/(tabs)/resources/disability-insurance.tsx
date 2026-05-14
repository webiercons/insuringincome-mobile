import { ScrollView, StyleSheet, Text } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { PublicColors } from '@/constants/public-theme';

export default function DisabilityInsuranceScreen() {
  return (
    <PublicScreenShell showBack title="Disability insurance" subtitle="Income when you cannot work due to illness or injury.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Most households spend every paycheck within weeks. A long-term disability can exhaust savings faster than almost
          any other risk—yet group LTD through an employer often caps benefits and uses taxable definitions you should
          review with a professional.
        </Text>
        <Section
          k="Core definitions"
          p="Benefit amount, elimination (waiting) period, benefit period, and definition of disability (own-occupation vs any-occupation) determine when and how much the carrier pays."
        />
        <Section
          k="Partial and residual"
          p="Many contracts include partial disability benefits if you return to work at reduced earnings. Residual riders can bridge the gap during recovery."
        />
        <Section
          k="Underwriting"
          p="Occupation class, health history, and financial documentation influence offer and premium. Expect a fluid process with your advisor—not instant bind from an app screen."
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
