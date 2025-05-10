import { View, Text, Image, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@/Providers/AuthProvider';
import { useNetwork } from '@/Providers/NetworkProvider';

const Home = () => {
  const router = useRouter();
  const { data } = useAuth();
  const isConnected = useNetwork();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    background: isDarkMode ? '#121212' : '#FFF7D4',
    text: isDarkMode ? '#FFFFFF' : '#000000',
    subtitle: isDarkMode ? '#BBBBBB' : '#555555',
    buttonBackground: '#084C61',
    buttonText: '#FFFFFF',
  };

  const handleMoveToShop = async () => {
    router.replace('/Search');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      <Text style={[styles.title, { color: theme.text }]}>Lemon Toy</Text>
      <Text style={[styles.subtitle, { color: theme.subtitle }]}>
        Discover amazing toys{'\n'}and fun games anytime, anywhere!
      </Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonBackground }]} onPress={handleMoveToShop}>
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>SHOP NOW</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default Home;
