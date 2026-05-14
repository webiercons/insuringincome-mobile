import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { PublicColors } from '@/constants/public-theme';

export default function UploadDocumentsScreen() {
  const [note, setNote] = useState('');
  const [picked, setPicked] = useState<string | null>(null);

  async function onPick() {
    try {
      const res = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
      if (res.canceled) {
        return;
      }
      const f = res.assets[0];
      setPicked(f?.name ?? 'Selected file');
    } catch {
      Alert.alert('Could not open picker', 'Try again or contact your advisor for another intake path.');
    }
  }

  function onReview() {
    Alert.alert(
      'Intake not yet connected',
      'This build demonstrates the upload entry point only. Your advisor will confirm when secure transmission to Insuring Income systems is enabled for your account.',
      [{ text: 'OK' }],
    );
  }

  return (
    <PublicScreenShell
      showBack
      title="Upload documents"
      subtitle="Prepare materials for underwriting or policy service — transmission stays offline until backend intake is wired.">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.p}>
          Use this flow only for non-sensitive drafts until your advisor confirms production intake. Nothing leaves this
          device except when a future release connects to our approved API.
        </Text>
        <Pressable onPress={() => void onPick()} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryLabel}>Choose a file</Text>
        </Pressable>
        {picked ? <Text style={styles.picked}>Selected: {picked}</Text> : null}
        <Text style={styles.label}>Note to your team (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Updated pay stubs for May"
          placeholderTextColor={PublicColors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />
        <Pressable onPress={onReview} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
          <Text style={styles.secondaryLabel}>Review & submit (demo)</Text>
        </Pressable>
      </ScrollView>
    </PublicScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, gap: 0 },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: PublicColors.textMuted,
    marginBottom: 16,
  },
  primary: {
    backgroundColor: PublicColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondary: {
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PublicColors.border,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: PublicColors.surface,
  },
  pressed: { opacity: 0.9 },
  primaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  secondaryLabel: { fontSize: 16, fontWeight: '600', color: PublicColors.accent },
  picked: { fontSize: 14, color: PublicColors.text, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: PublicColors.text, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: PublicColors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: PublicColors.text,
    backgroundColor: PublicColors.surface,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
