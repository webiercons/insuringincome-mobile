import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { TrustFootnote } from '@/components/public/trust-footnote';
import { PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';
import { buildDocumentIntakeDraftV1 } from '@/lib/public-intake-seams';

export default function UploadDocumentsScreen() {
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [note, setNote] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'picked'>('idle');

  async function onPick() {
    try {
      const res = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
      if (res.canceled) {
        return;
      }
      const f = res.assets[0];
      setPicked(f?.name ?? 'Selected file');
      setPhase('picked');
    } catch {
      Alert.alert('Could not open picker', 'Try again or ask your advisor for an alternate intake path.');
    }
  }

  function onMarkDraft() {
    const draft = buildDocumentIntakeDraftV1({
      selectedFileName: picked,
      advisorNote: note.trim(),
    });
    Alert.alert(
      'Draft saved locally',
      `Version ${draft.schemaVersion} document draft is ready for a future secure upload API. Filename: ${draft.selectedFileName ?? 'none'}. Nothing was transmitted.`,
      [{ text: 'OK' }],
    );
  }

  return (
    <PublicScreenShell
      showBack
      title="Upload documents"
      subtitle="Prepare materials for underwriting or service — transmission is not enabled in this release.">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.statusBanner, { backgroundColor: palette.accentSoft, borderColor: palette.border }]}>
          <Text style={[styles.statusTitle, { color: palette.text }]}>Offline staging only</Text>
          <Text style={[styles.statusBody, { color: palette.textMuted }]}>
            Files stay on this device. Your advisor will confirm when encrypted intake to Insuring Income systems is
            available for your relationship.
          </Text>
        </View>

        <Pressable onPress={() => void onPick()} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryLabel}>{phase === 'picked' ? 'Replace file' : 'Choose a file'}</Text>
        </Pressable>
        {picked ? (
          <Text style={[styles.picked, { color: palette.text }]}>
            Selected: <Text style={{ fontWeight: '700' }}>{picked}</Text>
          </Text>
        ) : (
          <Text style={[styles.muted, { color: palette.textMuted }]}>No file selected yet.</Text>
        )}

        <Text style={styles.label}>Note for your advisor (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Updated disability labs, employer LTD summary"
          placeholderTextColor={palette.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TrustFootnote palette={palette}>
          Future: multipart upload to a presigned URL or authenticated `DocumentIntakeDraftV1` handoff — see
          `lib/public-intake-seams.ts`.
        </TrustFootnote>

        <Pressable onPress={onMarkDraft} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryLabel}>Save local draft (not submitted)</Text>
        </Pressable>
      </ScrollView>
    </PublicScreenShell>
  );
}

function createStyles(p: ReturnType<typeof usePublicPalette>) {
  return StyleSheet.create({
    scroll: { paddingBottom: 40, gap: 0 },
    statusBanner: {
      borderRadius: PublicLayout.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      padding: PublicLayout.cardPadding,
      marginBottom: PublicLayout.gapLg,
    },
    statusTitle: {
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 6,
    },
    statusBody: {
      fontSize: 14,
      lineHeight: 21,
    },
    primary: {
      backgroundColor: p.accent,
      borderRadius: PublicLayout.cardRadius,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    primaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
    secondary: {
      marginTop: 16,
      borderRadius: PublicLayout.cardRadius,
      borderWidth: 1,
      borderColor: p.border,
      paddingVertical: 16,
      alignItems: 'center',
      backgroundColor: p.surface,
    },
    secondaryLabel: { fontSize: 15, fontWeight: '800', color: p.accent },
    pressed: { opacity: 0.9 },
    picked: { fontSize: 14, marginBottom: 8 },
    muted: { fontSize: 14, marginBottom: 8 },
    label: { fontSize: 13, fontWeight: '700', color: p.text, marginBottom: 8, marginTop: 8 },
    input: {
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: PublicLayout.inputRadius,
      padding: 14,
      fontSize: 16,
      color: p.text,
      backgroundColor: p.surface,
      minHeight: 100,
      textAlignVertical: 'top',
    },
  });
}
