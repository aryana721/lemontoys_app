import { View, Text, Button, SafeAreaView, StyleSheet } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@/Providers/AuthProvider';

const Home = () => {
  const router = useRouter();
  const { data } = useAuth();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      console.log('User logged out successfully.');
      router.replace('/Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Button title="Logout" onPress={handleLogout} />
      <Text style={styles.userData}>{JSON.stringify(data)}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  userData: {
    marginTop: 20,
    fontSize: 14,
    color: '#555',
  },
});

export default Home;
