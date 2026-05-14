import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { PublicColors } from '@/constants/public-theme';

export default function AccountHubScreen() {
  const router = useRouter();

  return (
    <PublicScreenShell title="Account" subtitle="Documents, scheduling, and app preferences.">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Consumer workflows live here. Advisor and team sign-in is separate and only appears when you choose it.
        </Text>
        <NavTile
          title="Upload documents"
          body="Securely share underwriting or policy paperwork when your advisor enables intake for this channel."
          onPress={() => router.push('/(public)/(tabs)/account/upload-documents')}
        />
        <NavTile
          title="Contact & schedule"
          body="Request a consultation or callback from our licensed team."
          onPress={() => router.push('/(public)/(tabs)/account/contact')}
        />
        <NavTile
          title="Settings"
          body="Notifications, accessibility, and advisor access from this device."
          onPress={() => router.push('/(public)/(tabs)/account/settings')}
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
  scroll: { paddingBottom: 32 },
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
  tilePressed: { opacity: 0.92 },
  tileTitle: { fontSize: 18, fontWeight: '700', color: PublicColors.text },
  tileBody: { marginTop: 6, fontSize: 14, lineHeight: 20, color: PublicColors.textMuted },
  tileLink: { marginTop: 10, fontSize: 15, fontWeight: '600', color: PublicColors.accent },
});
