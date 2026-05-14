import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PublicLayout } from '@/constants/public-layout';
import type { PublicPalette } from '@/constants/public-theme';
import { usePublicPalette } from '@/hooks/use-public-palette';

type PublicScreenShellProps = ViewProps & {
  title: string;
  subtitle?: string;
  /** When true, shows a back control (stack child screens). */
  showBack?: boolean;
};

export function PublicScreenShell({ title, subtitle, children, style, showBack, ...rest }: PublicScreenShellProps) {
  const router = useRouter();
  const palette = usePublicPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);

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

function createStyles(p: PublicPalette) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: p.canvas,
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
      color: p.accent,
    },
    header: {
      paddingHorizontal: PublicLayout.screenPaddingX,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: p.border,
      backgroundColor: p.surface,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: p.text,
      letterSpacing: -0.45,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 15,
      lineHeight: 22,
      color: p.textMuted,
    },
    body: {
      flex: 1,
      paddingHorizontal: PublicLayout.screenPaddingX,
      paddingTop: PublicLayout.sectionGap,
      backgroundColor: p.canvas,
    },
  });
}
