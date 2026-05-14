import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { InternalColors } from '@/constants/internal-theme';
import { useAuth } from '@/contexts/auth-context';
import { getPendingMfa, clearPendingMfa } from '@/lib/internal-auth-pending';
import { postInternalMobile } from '@/lib/internal-mobile-api';

export default function MfaChallengeScreen() {
  const { completeAuthExchange } = useAuth();
  const [code, setCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!getPendingMfa()) {
      router.replace('/(auth)/login');
    }
  }, []);

  async function onSubmit() {
    setError(null);
    const p = getPendingMfa();
    if (!p) {
      setError('This challenge expired. Sign in again.');
      return;
    }
    if (!code.trim() && !recoveryCode.trim()) {
      setError('Enter a code from your authenticator app or a recovery code.');
      return;
    }
    setBusy(true);
    try {
      const body = await postInternalMobile<unknown>(
        '/auth/mfa-verify',
        {
          mfa_challenge_id: p.challengeId,
          code: code.trim() || undefined,
          recovery_code: recoveryCode.trim() || undefined,
          device: p.device,
        },
        null,
      );
      await completeAuthExchange(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  }

  const pending = getPendingMfa();
  if (!pending) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify it’s you</Text>
        <Text style={styles.sub}>
          Multi-factor authentication is required for operator tools. Open your authenticator app and enter the 6-digit
          code for Insuring Income{pending.hint ? ` (${pending.hint})` : ''}.
        </Text>
        <Text style={styles.label}>Authenticator code</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="123456"
          placeholderTextColor={InternalColors.textMuted}
          style={styles.input}
        />
        <Text style={styles.label}>Recovery code (optional)</Text>
        <TextInput
          value={recoveryCode}
          onChangeText={setRecoveryCode}
          autoCapitalize="characters"
          placeholder="Use instead of authenticator code"
          placeholderTextColor={InternalColors.textMuted}
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          onPress={() => void onSubmit()}
          disabled={busy}
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed, busy && styles.disabled]}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryLabel}>Verify & continue</Text>}
        </Pressable>
        <Pressable
          onPress={() => {
            clearPendingMfa();
            router.replace('/(auth)/login');
          }}
          style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}>
          <Text style={styles.linkLabel}>Cancel</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: InternalColors.background,
  },
  card: {
    backgroundColor: InternalColors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: InternalColors.border,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: InternalColors.text,
  },
  sub: {
    fontSize: 14,
    lineHeight: 21,
    color: InternalColors.textMuted,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: InternalColors.text,
    marginTop: 4,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: InternalColors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, default: 10 }),
    fontSize: 16,
    color: InternalColors.text,
    backgroundColor: '#f8fafc',
  },
  error: {
    color: InternalColors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  primary: {
    marginTop: 12,
    backgroundColor: InternalColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryPressed: { opacity: 0.92 },
  disabled: { opacity: 0.65 },
  primaryLabel: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 14, paddingVertical: 8, alignSelf: 'center' },
  linkPressed: { opacity: 0.85 },
  linkLabel: { fontSize: 15, fontWeight: '600', color: InternalColors.accentMuted },
});
