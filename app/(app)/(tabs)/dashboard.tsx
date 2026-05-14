import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';

export default function DashboardScreen() {
  return (
    <ScreenShell title="Dashboard" subtitle="Operational overview">
      <Text style={styles.body}>
        Placeholder: wire KPIs, renewals, and pipeline health once backend endpoints are ready.
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
