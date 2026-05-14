import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="link-work-account" />
      <Stack.Screen name="mfa-challenge" />
    </Stack>
  );
}
