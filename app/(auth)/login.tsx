import { useMemo, useState } from 'react';
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
import * as AppleAuthentication from 'expo-apple-authentication';

import { GoogleSignInButton } from '@/components/internal/google-sign-in-button';
import { InternalColors } from '@/constants/internal-theme';
import { useAuth } from '@/contexts/auth-context';
import { getExtra } from '@/lib/env';

export default function LoginScreen() {
  const { signInWithPassword, signInWithAppleIdentityToken } = useAuth();
  const extra = useMemo(() => getExtra(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [appleBusy, setAppleBusy] = useState(false);

  const googleConfigured =
    (Platform.OS === 'ios' && !!extra.googleIosClientId) ||
    (Platform.OS === 'android' && (!!extra.googleAndroidClientId || !!extra.googleWebClientId)) ||
    (Platform.OS === 'web' && !!extra.googleWebClientId);

  async function onSubmitPassword() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your work email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithPassword(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function onApple() {
    setError(null);
    setAppleBusy(true);
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        setError('Apple sign-in is not available on this device.');
        return;
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        setError('Apple did not return an identity token.');
        return;
      }
      await signInWithAppleIdentityToken(credential.identityToken);
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Apple sign-in failed');
    } finally {
      setAppleBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.brand}>Insuring Income</Text>
        <Text style={styles.lockLabel}>Internal access</Text>
        <Text style={styles.helper}>
          {extra.apiBaseUrl
            ? 'Sign in with your approved work identity. Tokens stay in the device secure enclave.'
            : 'Configure EXPO_PUBLIC_API_BASE_URL before signing in.'}
        </Text>

        {googleConfigured ? (
          <GoogleSignInButton
            iosClientId={extra.googleIosClientId || undefined}
            androidClientId={extra.googleAndroidClientId || extra.googleWebClientId || undefined}
            webClientId={extra.googleWebClientId || undefined}
          />
        ) : (
          <Text style={styles.mutedBlock}>
            Google sign-in is not configured for this build. Add Expo public Google client IDs for your
            platform.
          </Text>
        )}

        {Platform.OS === 'ios' ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={styles.appleBtn}
            onPress={() => void onApple()}
          />
        ) : null}
        {appleBusy ? (
          <View style={styles.appleSpinner}>
            <ActivityIndicator />
          </View>
        ) : null}

        {extra.internalMobilePasswordAuthEnabled ? (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Password (internal only)</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
              value={email}
              onChangeText={setEmail}
              placeholder="you@insuringincome.com"
              placeholderTextColor={InternalColors.textMuted}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              secureTextEntry
              textContentType="password"
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={InternalColors.textMuted}
              style={styles.input}
            />

            <Pressable
              onPress={() => void onSubmitPassword()}
              disabled={submitting}
              style={({ pressed }) => [
                styles.secondaryCta,
                pressed && styles.secondaryCtaPressed,
                submitting && styles.secondaryCtaDisabled,
              ]}>
              {submitting ? (
                <ActivityIndicator color={InternalColors.accent} />
              ) : (
                <Text style={styles.secondaryCtaLabel}>Sign in with password</Text>
              )}
            </Pressable>
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
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
    gap: 12,
  },
  brand: {
    fontSize: 26,
    fontWeight: '700',
    color: InternalColors.text,
    letterSpacing: -0.4,
  },
  lockLabel: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: InternalColors.accent,
  },
  helper: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    color: InternalColors.textMuted,
  },
  mutedBlock: {
    fontSize: 14,
    lineHeight: 20,
    color: InternalColors.textMuted,
  },
  appleBtn: {
    width: '100%',
    height: 48,
    marginTop: 4,
  },
  appleSpinner: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: InternalColors.border,
  },
  dividerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: InternalColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabel: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: InternalColors.text,
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
  secondaryCta: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: InternalColors.border,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: InternalColors.surface,
  },
  secondaryCtaPressed: {
    opacity: 0.9,
  },
  secondaryCtaDisabled: {
    opacity: 0.6,
  },
  secondaryCtaLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: InternalColors.accent,
  },
  error: {
    marginTop: 8,
    color: InternalColors.danger,
    fontSize: 14,
  },
});
