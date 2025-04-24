import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '@/Providers/AuthProvider';

export default function Index() {
  const { loggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const targetRoute = loggedIn ? '/Home' : '/Login';
      console.log('Navigating to:', targetRoute);
      router.replace(targetRoute);
    }
  }, [loading, loggedIn]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Optional fallback UI if not redirected instantly
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
