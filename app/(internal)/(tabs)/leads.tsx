import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';

export default function LeadsScreen() {
  return (
    <ScreenShell title="Leads" subtitle="Inbound and outbound pipeline">
      <Text style={styles.body}>
        Lead queues, filters, and assignment rules will load here once internal endpoints are available.
      </Text>
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
