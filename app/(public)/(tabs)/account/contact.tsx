import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { PublicColors } from '@/constants/public-theme';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [preferred, setPreferred] = useState('');

  function onSubmit() {
    if (!email.trim() && !phone.trim()) {
      Alert.alert('Add contact detail', 'Please enter an email or phone number so we can reach you.');
      return;
    }
    Alert.alert(
      'Request recorded (demo)',
      'This release does not transmit scheduling data yet. Your entries stay on this device until the public intake API is enabled.',
      [{ text: 'OK' }],
    );
  }

  return (
    <PublicScreenShell
      showBack
      title="Contact & schedule"
      subtitle="Tell us how to reach you — no account required for this step.">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.p}>
          Licensed advisors respond during business hours. If you need immediate help with an in-force policy, call the
          number on your contract or declaration page.
        </Text>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Full name" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="Optional" keyboardType="phone-pad" />
        <Text style={styles.label}>What should we focus on?</Text>
        <TextInput
          style={styles.input}
          placeholder="Disability quote, life review, employer benefits, etc."
          placeholderTextColor={PublicColors.textMuted}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <Text style={styles.label}>Preferred times (optional)</Text>
        <TextInput
          style={styles.inputShort}
          placeholder="e.g. Tue/Thu mornings Pacific"
          placeholderTextColor={PublicColors.textMuted}
          value={preferred}
          onChangeText={setPreferred}
        />
        <Pressable onPress={onSubmit} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryLabel}>Request consultation</Text>
        </Pressable>
      </ScrollView>
    </PublicScreenShell>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.inputShort}
        placeholder={placeholder}
        placeholderTextColor={PublicColors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
    </View>
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
  field: { marginBottom: 14 },
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
    marginBottom: 14,
  },
  inputShort: {
    borderWidth: 1,
    borderColor: PublicColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, default: 10 }),
    fontSize: 16,
    color: PublicColors.text,
    backgroundColor: PublicColors.surface,
  },
  primary: {
    marginTop: 8,
    backgroundColor: PublicColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pressed: { opacity: 0.9 },
  primaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});
