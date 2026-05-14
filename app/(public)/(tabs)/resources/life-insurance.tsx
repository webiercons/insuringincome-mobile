import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { EducationTopicCard } from '@/components/public/education-topic-card';
import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { TrustFootnote } from '@/components/public/trust-footnote';
import { getEducationTopicsForScreen } from '@/constants/public-education-content';
import { PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';

export default function LifeInsuranceScreen() {
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const topics = getEducationTopicsForScreen('life');

  return (
    <PublicScreenShell
      showBack
      title="Life insurance"
      subtitle="Death benefit design for people who depend on your income or practice continuity.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Term and permanent solve different horizons. Your advisor should align structure with estate documents,
          business agreements, and liquidity needs — not product labels alone.
        </Text>
        {topics.map((t) => (
          <EducationTopicCard key={t.id} palette={palette} lens={t.lens} title={t.title} body={t.body} />
        ))}
        <TrustFootnote palette={palette}>
          Illustrations include nonguaranteed elements where applicable. Tax positions require individualized counsel.
        </TrustFootnote>
      </ScrollView>
    </PublicScreenShell>
  );
}

function createStyles(p: ReturnType<typeof usePublicPalette>) {
  return StyleSheet.create({
    scroll: { paddingBottom: 40 },
    lead: {
      fontSize: 15,
      lineHeight: 23,
      color: p.text,
      marginBottom: PublicLayout.gapMd,
    },
  });
}
