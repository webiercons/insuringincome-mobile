import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';

export default function DashboardScreen() {
  return (
    <ScreenShell title="Dashboard" subtitle="Operational overview">
        <Text style={styles.body}>
          Operational KPIs, renewals, and pipeline health will appear here once internal APIs are connected.
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
