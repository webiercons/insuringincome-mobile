import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';

export default function TasksScreen() {
  return (
    <ScreenShell title="Tasks" subtitle="Follow-ups and SLAs">
      <Text style={styles.body}>
        Tasks from CRM or ticketing will sync here once internal endpoints are available.
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
