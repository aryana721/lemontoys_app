import { Stack } from 'expo-router';

export default function MenuLayout() {
  return (
    <Stack>
      <Stack.Screen name="Login" options={{ title: 'Login',headerShown:false }}  />
      <Stack.Screen name="Register" options={{ title: 'Register',headerShown:false }} />
    </Stack>
  );
};