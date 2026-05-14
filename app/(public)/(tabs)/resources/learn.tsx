import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { EducationTopicCard } from '@/components/public/education-topic-card';
import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { TrustFootnote } from '@/components/public/trust-footnote';
import { getEducationTopicsForScreen } from '@/constants/public-education-content';
import { PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';

export default function LearnScreen() {
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const topics = getEducationTopicsForScreen('learn');

  return (
    <PublicScreenShell showBack title="Learn" subtitle="Foundations for confident, time-boxed reading.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Each card is a discrete topic — later versions can hydrate the same IDs from CMS or a public content API
          without changing routes.
        </Text>
        {topics.map((t) => (
          <EducationTopicCard key={t.id} palette={palette} lens={t.lens} title={t.title} body={t.body} />
        ))}
        <TrustFootnote palette={palette}>
          Education is general in nature and not personalized advice. State rules and product availability vary.
        </TrustFootnote>
      </ScrollView>
    </PublicScreenShell>
  );
}

function createStyles(p: ReturnType<typeof usePublicPalette>) {
  return StyleSheet.create({
    scroll: {
      paddingBottom: 40,
    },
    lead: {
      fontSize: 15,
      lineHeight: 23,
      color: p.textMuted,
      marginBottom: PublicLayout.gapMd,
    },
  });
}
