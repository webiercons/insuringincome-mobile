import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';

export default function ProposalsScreen() {
  return (
    <ScreenShell title="Proposals" subtitle="Draft and issued proposals">
      <Text style={styles.body}>Placeholder: list proposals with status, carrier, and premium summaries.</Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
});
