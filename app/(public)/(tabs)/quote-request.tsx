import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PublicScreenShell } from '@/components/public/public-screen-shell';
import { TrustFootnote } from '@/components/public/trust-footnote';
import { PublicLayout } from '@/constants/public-layout';
import { usePublicPalette } from '@/hooks/use-public-palette';
import { buildQuoteIntakePayloadV1, type QuotePracticeRole } from '@/lib/public-intake-seams';

type ProductInterest = 'disability' | 'life' | 'both' | 'unsure';

const STEPS = 5;

export default function QuoteRequestScreen() {
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [step, setStep] = useState(0);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [practiceRole, setPracticeRole] = useState<QuotePracticeRole>('');
  const [interest, setInterest] = useState<ProductInterest>('unsure');
  const [notes, setNotes] = useState('');

  function buildPayload() {
    return buildQuoteIntakePayloadV1({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      postalCode: postalCode.trim(),
      email: email.trim(),
      medicalSpecialtyOrRole: specialty.trim(),
      practiceRole,
      productInterest: interest,
      notes: notes.trim(),
    });
  }

  function onSubmitLocal() {
    const payload = buildPayload();
    Alert.alert(
      'Outline saved on this device',
      `Version ${payload.schemaVersion} intake is ready for a future POST to your public API. Nothing was transmitted. You can screenshot this summary for your advisor: ${payload.firstName} ${payload.lastName}, ${payload.postalCode}, interest: ${payload.productInterest}.`,
      [{ text: 'OK' }],
    );
  }

  function next() {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Name required', 'Legal first and last name help advisors match occupation class.');
        return;
      }
      if (!postalCode.trim()) {
        Alert.alert('Location', 'ZIP or postal code anchors state-specific product availability.');
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <PublicScreenShell
      title="Quote outline"
      subtitle="Staged intake for physicians and professionals — advisor-led before any offer.">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.progress}>
          {Array.from({ length: STEPS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { backgroundColor: i <= step ? palette.accent : palette.border },
              ]}
            />
          ))}
          <Text style={styles.progressLabel}>
            Step {step + 1} of {STEPS}
          </Text>
        </View>

        {step === 0 ? (
          <>
            <Text style={styles.lead}>
              This flow captures how you want to be contacted and what coverage dimensions matter. It does not run
              instant underwriting or pricing — your advisor pairs it with carrier illustrations.
            </Text>
            <TrustFootnote palette={palette}>
              Future integration: POST JSON matching `QuoteIntakePayloadV1` from `lib/public-intake-seams.ts` to your
              public intake service when enabled.
            </TrustFootnote>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Text style={styles.stepTitle}>You & location</Text>
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Legal first name"
              placeholderTextColor={palette.textMuted}
            />
            <Text style={styles.label}>Last name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Legal last name"
              placeholderTextColor={palette.textMuted}
            />
            <Text style={styles.label}>ZIP / postal code</Text>
            <TextInput
              style={styles.input}
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="Where coverage would be issued"
              placeholderTextColor={palette.textMuted}
              keyboardType="numbers-and-punctuation"
            />
            <Text style={styles.label}>Email (recommended)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="For advisor follow-up"
              placeholderTextColor={palette.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={styles.stepTitle}>Practice context</Text>
            <Text style={styles.hint}>Helps advisors map occupation class and employer coverage questions.</Text>
            <Text style={styles.label}>Specialty or role (optional)</Text>
            <TextInput
              style={styles.input}
              value={specialty}
              onChangeText={setSpecialty}
              placeholder="e.g. Anesthesiology, hospital-employed"
              placeholderTextColor={palette.textMuted}
            />
            <Text style={styles.label}>Primary situation</Text>
            <View style={styles.chips}>
              <RoleChip label="Attending" selected={practiceRole === 'attending'} onPress={() => setPracticeRole('attending')} palette={palette} />
              <RoleChip
                label="Resident / fellow"
                selected={practiceRole === 'resident_fellow'}
                onPress={() => setPracticeRole('resident_fellow')}
                palette={palette}
              />
              <RoleChip
                label="Practice owner"
                selected={practiceRole === 'practice_owner'}
                onPress={() => setPracticeRole('practice_owner')}
                palette={palette}
              />
              <RoleChip label="Employed" selected={practiceRole === 'employed'} onPress={() => setPracticeRole('employed')} palette={palette} />
              <RoleChip label="Other" selected={practiceRole === 'other'} onPress={() => setPracticeRole('other')} palette={palette} />
            </View>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text style={styles.stepTitle}>Coverage goals</Text>
            <Text style={styles.label}>Primary interest</Text>
            <View style={styles.chips}>
              <InterestChip label="Disability" selected={interest === 'disability'} onPress={() => setInterest('disability')} palette={palette} />
              <InterestChip label="Life" selected={interest === 'life'} onPress={() => setInterest('life')} palette={palette} />
              <InterestChip label="Both" selected={interest === 'both'} onPress={() => setInterest('both')} palette={palette} />
              <InterestChip label="Not sure" selected={interest === 'unsure'} onPress={() => setInterest('unsure')} palette={palette} />
            </View>
            <Text style={styles.label}>Notes for your advisor</Text>
            <TextInput
              style={styles.textarea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Income to protect, employer LTD, target budget, business overhead, etc."
              placeholderTextColor={palette.textMuted}
              multiline
            />
          </>
        ) : null}

        {step === 4 ? (
          <>
            <Text style={styles.stepTitle}>Review</Text>
            <Text style={styles.reviewLine}>
              <Text style={styles.reviewKey}>Name: </Text>
              {firstName} {lastName}
            </Text>
            <Text style={styles.reviewLine}>
              <Text style={styles.reviewKey}>Location: </Text>
              {postalCode}
            </Text>
            <Text style={styles.reviewLine}>
              <Text style={styles.reviewKey}>Email: </Text>
              {email || '—'}
            </Text>
            <Text style={styles.reviewLine}>
              <Text style={styles.reviewKey}>Practice: </Text>
              {specialty || '—'} {practiceRole ? `(${practiceRole})` : ''}
            </Text>
            <Text style={styles.reviewLine}>
              <Text style={styles.reviewKey}>Interest: </Text>
              {interest}
            </Text>
            <Text style={styles.reviewBlock}>{notes || '—'}</Text>
            <TrustFootnote palette={palette}>
              Submitting stores a versioned payload locally only. Binding quotes require licensed review, illustrations,
              and state-appropriate applications.
            </TrustFootnote>
            <Pressable onPress={onSubmitLocal} style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
              <Text style={styles.submitLabel}>Save outline on device</Text>
            </Pressable>
          </>
        ) : null}

        <View style={styles.navRow}>
          {step > 0 ? (
            <Pressable onPress={back} style={({ pressed }) => [styles.navBtn, styles.navGhost, pressed && styles.pressed]}>
              <Text style={styles.navGhostLabel}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.navSpacer} />
          )}
          {step < STEPS - 1 ? (
            <Pressable onPress={next} style={({ pressed }) => [styles.navBtn, styles.navPrimary, pressed && styles.pressed]}>
              <Text style={styles.navPrimaryLabel}>Continue</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </PublicScreenShell>
  );
}

function RoleChip({
  label,
  selected,
  onPress,
  palette,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  palette: ReturnType<typeof usePublicPalette>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        chipBase.chip,
        {
          borderColor: selected ? palette.accent : palette.border,
          backgroundColor: selected ? palette.accentSoft : palette.surface,
        },
      ]}>
      <Text style={[chipBase.chipLabel, { color: selected ? palette.accent : palette.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

function InterestChip({
  label,
  selected,
  onPress,
  palette,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  palette: ReturnType<typeof usePublicPalette>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        chipBase.chip,
        {
          borderColor: selected ? palette.accent : palette.border,
          backgroundColor: selected ? palette.accentSoft : palette.surface,
        },
      ]}>
      <Text style={[chipBase.chipLabel, { color: selected ? palette.accent : palette.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const chipBase = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});

function createStyles(p: ReturnType<typeof usePublicPalette>) {
  return StyleSheet.create({
    scroll: { paddingBottom: 48 },
    progress: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: PublicLayout.gapLg,
      flexWrap: 'wrap',
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    progressLabel: {
      marginLeft: 8,
      fontSize: 13,
      fontWeight: '700',
      color: p.textMuted,
    },
    lead: {
      fontSize: 15,
      lineHeight: 23,
      color: p.text,
      marginBottom: 8,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: p.text,
      marginBottom: 8,
      letterSpacing: -0.2,
    },
    hint: {
      fontSize: 14,
      lineHeight: 20,
      color: p.textMuted,
      marginBottom: 12,
    },
    label: { fontSize: 13, fontWeight: '700', color: p.text, marginTop: 12, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: PublicLayout.inputRadius,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: p.text,
      backgroundColor: p.surface,
    },
    textarea: {
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: PublicLayout.inputRadius,
      padding: 14,
      fontSize: 16,
      color: p.text,
      backgroundColor: p.surface,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    reviewLine: {
      fontSize: 15,
      lineHeight: 22,
      color: p.text,
      marginBottom: 8,
    },
    reviewKey: { fontWeight: '800', color: p.textMuted },
    reviewBlock: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 22,
      color: p.textMuted,
    },
    submit: {
      marginTop: 20,
      backgroundColor: p.accent,
      borderRadius: PublicLayout.cardRadius,
      paddingVertical: 16,
      alignItems: 'center',
    },
    submitLabel: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
    pressed: { opacity: 0.9 },
    navRow: {
      marginTop: 28,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    navSpacer: { flex: 1 },
    navBtn: {
      borderRadius: PublicLayout.cardRadius,
      paddingVertical: 14,
      paddingHorizontal: 20,
      minWidth: 120,
      alignItems: 'center',
    },
    navPrimary: {
      backgroundColor: p.accent,
      flex: 1,
    },
    navPrimaryLabel: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
    },
    navGhost: {
      borderWidth: 1,
      borderColor: p.border,
      backgroundColor: p.surface,
    },
    navGhostLabel: {
      color: p.accent,
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
