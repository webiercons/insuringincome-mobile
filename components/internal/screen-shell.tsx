import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InternalColors } from '@/constants/internal-theme';

type ScreenShellProps = ViewProps & {
  title: string;
  subtitle?: string;
};

export function ScreenShell({ title, subtitle, children, style, ...rest }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
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
    backgroundColor: InternalColors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: InternalColors.border,
    backgroundColor: InternalColors.surface,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: InternalColors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: InternalColors.textMuted,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: InternalColors.background,
  },
});
