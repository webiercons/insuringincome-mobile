import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { PublicColors } from '@/constants/public-theme';

export default function ResourcesHubScreen() {
  const router = useRouter();

  return (
    <PublicScreenShell title="Explore" subtitle="Education and coverage types — no account required.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Understand how income protection fits your financial plan before you speak with an advisor.
        </Text>
        <NavTile
          title="Learn"
          body="Foundational guides on how disability and life insurance support long-term stability."
          onPress={() => router.push('/(public)/(tabs)/resources/learn')}
        />
        <NavTile
          title="Disability insurance"
          body="How paycheck protection works, elimination periods, and own-occupation vs any-occupation language."
          onPress={() => router.push('/(public)/(tabs)/resources/disability-insurance')}
        />
        <NavTile
          title="Life insurance"
          body="Term, permanent, and how death benefit design aligns with family and business obligations."
          onPress={() => router.push('/(public)/(tabs)/resources/life-insurance')}
        />
      </ScrollView>
    </PublicScreenShell>
  );
}

function NavTile({ title, body, onPress }: { title: string; body: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileBody}>{body}</Text>
      <Text style={styles.tileLink}>Open ›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    color: PublicColors.text,
    marginBottom: 20,
  },
  tile: {
    backgroundColor: PublicColors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PublicColors.border,
    padding: 16,
    marginBottom: 12,
  },
  tilePressed: {
    opacity: 0.92,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: PublicColors.text,
  },
  tileBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: PublicColors.textMuted,
  },
  tileLink: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: PublicColors.accent,
  },
});
