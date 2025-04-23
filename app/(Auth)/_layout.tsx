import { Stack } from 'expo-router';

export default function MenuLayout() {
  return (
    <Stack>
      <Stack.Screen name="Login" options={{ title: 'Login' }} />
      <Stack.Screen name="Register" options={{ title: 'Register' }} />
    </Stack>
  );
};