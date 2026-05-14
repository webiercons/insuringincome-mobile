import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { EducationTopicCard } from '@/components/public/education-topic-card';
import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { TrustFootnote } from '@/components/public/trust-footnote';
import { getEducationTopicsForScreen } from '@/constants/public-education-content';
import { PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';

export default function DisabilityInsuranceScreen() {
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const topics = getEducationTopicsForScreen('disability');

  return (
    <PublicScreenShell
      showBack
      title="Disability insurance"
      subtitle="Income when you cannot work — framed for clinical careers.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Employer group LTD is a start, but benefit caps, tax treatment, and definition language may not match your
          specialty or earnings curve. Use these cards to align vocabulary with your advisor before illustrations.
        </Text>
        {topics.map((t) => (
          <EducationTopicCard key={t.id} palette={palette} lens={t.lens} title={t.title} body={t.body} />
        ))}
        <TrustFootnote palette={palette}>
          Definitions and offers vary by carrier and state. Nothing here is a solicitation or guarantee of coverage.
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
