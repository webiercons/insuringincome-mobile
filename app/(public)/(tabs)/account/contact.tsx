import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { TrustFootnote } from '@/components/public/trust-footnote';
import { PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';
import { buildContactIntakePayloadV1 } from '@/lib/public-intake-seams';

export default function ContactScreen() {
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [message, setMessage] = useState('');
  const [preferred, setPreferred] = useState('');

  function onSubmit() {
    if (!email.trim() && !phone.trim()) {
      Alert.alert('Contact detail', 'Add a professional email or phone so an advisor can reach you.');
      return;
    }
    const payload = buildContactIntakePayloadV1({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      medicalSpecialtyOrRole: specialty.trim(),
      message: message.trim(),
      preferredTimes: preferred.trim(),
    });
    Alert.alert(
      'Request drafted locally',
      `Version ${payload.schemaVersion} contact payload is ready for a future public scheduling API. Nothing was transmitted.`,
      [{ text: 'OK' }],
    );
  }

  return (
    <PublicScreenShell
      showBack
      title="Contact & schedule"
      subtitle="Tell us how to reach you — calendar integration comes later.">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.banner, { backgroundColor: palette.accentSoft, borderColor: palette.border }]}>
          <Text style={[styles.bannerText, { color: palette.textMuted }]}>
            Licensed advisors respond during business hours. For in-force policy emergencies, use the carrier number on
            your contract or card.
          </Text>
        </View>

        <Field label="Name" value={name} onChangeText={setName} placeholder="Full name" palette={palette} />
        <Field
          label="Professional email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@hospital.org"
          keyboardType="email-address"
          palette={palette}
        />
        <Field label="Phone (optional)" value={phone} onChangeText={setPhone} placeholder="Direct or mobile" keyboardType="phone-pad" palette={palette} />
        <Field
          label="Specialty / role (optional)"
          value={specialty}
          onChangeText={setSpecialty}
          placeholder="Helps route to the right advisor"
          palette={palette}
        />

        <Text style={styles.label}>What should we focus on?</Text>
        <TextInput
          style={styles.input}
          placeholder="Disability review, life coverage for partnership agreement, etc."
          placeholderTextColor={palette.textMuted}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <Text style={styles.label}>Preferred times (optional)</Text>
        <TextInput
          style={styles.inputShort}
          placeholder="e.g. Tue/Thu mornings Pacific"
          placeholderTextColor={palette.textMuted}
          value={preferred}
          onChangeText={setPreferred}
        />

        <TrustFootnote palette={palette}>
          Future: POST `ContactIntakePayloadV1` to your public intake service; optional scheduling provider handoff later
          without changing this screen’s local-first behavior until wired.
        </TrustFootnote>

        <Pressable onPress={onSubmit} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
          <Text style={styles.primaryLabel}>Save request draft on device</Text>
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
  palette,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  palette: ReturnType<typeof usePublicPalette>;
}) {
  return (
    <View style={stylesField.field}>
      <Text style={[stylesField.label, { color: palette.text }]}>{label}</Text>
      <TextInput
        style={[
          stylesField.inputShort,
          { borderColor: palette.border, color: palette.text, backgroundColor: palette.surface },
        ]}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
    </View>
  );
}

const stylesField = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  inputShort: {
    borderWidth: 1,
    borderRadius: PublicLayout.inputRadius,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, default: 10 }),
    fontSize: 16,
  },
});

function createStyles(p: ReturnType<typeof usePublicPalette>) {
  return StyleSheet.create({
    scroll: { paddingBottom: 40 },
    banner: {
      borderRadius: PublicLayout.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      padding: PublicLayout.cardPadding,
      marginBottom: PublicLayout.gapLg,
    },
    bannerText: {
      fontSize: 14,
      lineHeight: 21,
    },
    label: { fontSize: 13, fontWeight: '700', color: p.text, marginBottom: 8 },
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
      marginBottom: 14,
    },
    inputShort: {
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: PublicLayout.inputRadius,
      paddingHorizontal: 14,
      paddingVertical: Platform.select({ ios: 12, default: 10 }),
      fontSize: 16,
      color: p.text,
      backgroundColor: p.surface,
      marginBottom: 14,
    },
    primary: {
      marginTop: 8,
      backgroundColor: p.accent,
      borderRadius: PublicLayout.cardRadius,
      paddingVertical: 16,
      alignItems: 'center',
    },
    pressed: { opacity: 0.9 },
    primaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  });
}
