import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PublicColors } from '@/constants/public-theme';

type PublicScreenShellProps = ViewProps & {
  title: string;
  subtitle?: string;
  /** When true, shows a back control (stack child screens). */
  showBack?: boolean;
};

export function PublicScreenShell({ title, subtitle, children, style, showBack, ...rest }: PublicScreenShellProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {showBack ? (
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.body, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PublicColors.canvas,
  },
  topBar: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  back: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: PublicColors.accent,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PublicColors.border,
    backgroundColor: PublicColors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: PublicColors.text,
    letterSpacing: -0.35,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: PublicColors.textMuted,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    backgroundColor: PublicColors.canvas,
  },
});
