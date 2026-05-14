import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { PublicColors } from '@/constants/public-theme';

type ProductInterest = 'disability' | 'life' | 'both' | 'unsure';

export default function QuoteRequestScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [zip, setZip] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState<ProductInterest>('unsure');
  const [notes, setNotes] = useState('');

  function onSubmit() {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Add your name', 'First and last name help advisors prepare accurate illustrations.');
      return;
    }
    if (!zip.trim()) {
      Alert.alert('Add ZIP code', 'Rates and product availability vary by state.');
      return;
    }
    Alert.alert(
      'Quote outline saved locally (demo)',
      'The next release will POST this payload to our public intake endpoint. For now, nothing is transmitted.',
      [{ text: 'OK' }],
    );
  }

  return (
    <PublicScreenShell
      title="Quote request"
      subtitle="Outline your goals — a licensed advisor will follow up before any offer is made.">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.p}>
          This form establishes UX patterns for a future public API. Do not rely on it for binding quotes or
          underwriting decisions.
        </Text>
        <Text style={styles.label}>First name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Legal first name"
          placeholderTextColor={PublicColors.textMuted}
        />
        <Text style={styles.label}>Last name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Legal last name"
          placeholderTextColor={PublicColors.textMuted}
        />
        <Text style={styles.label}>ZIP code</Text>
        <TextInput
          style={styles.input}
          value={zip}
          onChangeText={setZip}
          placeholder="Where coverage would be issued"
          placeholderTextColor={PublicColors.textMuted}
          keyboardType="numbers-and-punctuation"
        />
        <Text style={styles.label}>Email (optional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="For advisor follow-up"
          placeholderTextColor={PublicColors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Primary interest</Text>
        <View style={styles.chips}>
          <Chip label="Disability" selected={interest === 'disability'} onPress={() => setInterest('disability')} />
          <Chip label="Life" selected={interest === 'life'} onPress={() => setInterest('life')} />
          <Chip label="Both" selected={interest === 'both'} onPress={() => setInterest('both')} />
          <Chip label="Not sure" selected={interest === 'unsure'} onPress={() => setInterest('unsure')} />
        </View>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={styles.textarea}
          value={notes}
          onChangeText={setNotes}
          placeholder="Income to protect, employer coverage, target monthly budget, etc."
          placeholderTextColor={PublicColors.textMuted}
          multiline
        />
        <Pressable onPress={onSubmit} style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
          <Text style={styles.submitLabel}>Submit outline</Text>
        </Pressable>
      </ScrollView>
    </PublicScreenShell>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: PublicColors.textMuted,
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: '600', color: PublicColors.text, marginTop: 12, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: PublicColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: PublicColors.text,
    backgroundColor: PublicColors.surface,
  },
  textarea: {
    borderWidth: 1,
    borderColor: PublicColors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: PublicColors.text,
    backgroundColor: PublicColors.surface,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PublicColors.border,
    backgroundColor: PublicColors.surface,
  },
  chipSelected: {
    borderColor: PublicColors.accent,
    backgroundColor: PublicColors.accentSoft,
  },
  chipLabel: { fontSize: 14, fontWeight: '600', color: PublicColors.textMuted },
  chipLabelSelected: { color: PublicColors.accent },
  submit: {
    marginTop: 24,
    backgroundColor: PublicColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  submitLabel: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
