import { StyleSheet, Text } from 'react-native';

import { ScreenShell } from '@/components/internal/screen-shell';

export default function RickAiScreen() {
  return (
    <ScreenShell title="RickAI" subtitle="Internal copilots and automations">
      <Text style={styles.body}>
        RickAI chat and task flows will connect here with audited logging once backend integration is ready.
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
