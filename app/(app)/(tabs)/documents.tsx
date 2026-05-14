import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';

export default function DocumentsScreen() {
  return (
    <ScreenShell title="Documents" subtitle="Policies, endorsements, and uploads">
      <Text style={styles.body}>Placeholder: integrate secure document retrieval and e-sign handoffs.</Text>
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
