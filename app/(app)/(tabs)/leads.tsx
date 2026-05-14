import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';

export default function LeadsScreen() {
  return (
    <ScreenShell title="Leads" subtitle="Inbound and outbound pipeline">
      <Text style={styles.body}>Placeholder: connect lead queues, filters, and assignment rules.</Text>
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
