import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useColorScheme
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/Providers/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetwork } from '@/Providers/NetworkProvider';

const { width } = Dimensions.get('window');

type Data = {
  identifier: string;
  password: string;
};

const Login: React.FC = () => {
  const isConnected = useNetwork();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const { setData } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateInputs = () => {
    if (!identifier || !password) {
      alert('Please fill in all fields');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) && !/^\d{10}$/.test(identifier)) {
      alert('Please enter a valid email address or mobile number');
      return false;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const loginUser = () => {
    Keyboard.dismiss();
    
    if (!validateInputs()) {
      return;
    }

    if (!isConnected) {
      alert('Please check your internet connection');
      return;
    }

    const url = `https://lemontoys-server.vercel.app/login`;
    const data: Data = {
      identifier,
      password
    };

    setLoading(true);

    axios.post(url, data)
      .then((response) => {
        const userData = response.data?.data;
        
        if (userData) {
          AsyncStorage.setItem('userData', JSON.stringify(userData))
            .then(() => {
              setData(userData);
              router.replace('/Home');
            })
            .catch((err) => {
              console.error('Failed to store user data in AsyncStorage:', err);
              alert('Error saving your login information. Please try again.');
            });
        } else {
          console.warn('No user data returned from login response.');
          alert('Invalid response from server. Please try again later.');
        }
      })
      .catch(function (error) {
        console.log(error);
        if (error.response?.status === 400) {
          alert('User not found.');
        } else if (error.response?.status === 403) {
          alert(error.response.data.message);
        } else {
          alert('Login failed. Please try again later.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Define theme colors
  const theme = {
    background: isDarkMode ? '#121212' : '#FFFFFF',
    cardBackground: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    subtitle: isDarkMode ? '#AAAAAA' : '#888888',
    border: isDarkMode ? '#333333' : '#CCCCCC',
    placeholder: isDarkMode ? '#777777' : '#999999',
    primary: '#008CBA', // Keep primary color consistent for brand identity
    divider: isDarkMode ? '#333333' : '#CCCCCC',
    inputBackground: isDarkMode ? '#2A2A2A' : '#FFFFFF',
    icon: isDarkMode ? '#AAAAAA' : '#666666',
  };

  return (
    <SafeAreaView style={[{ flex: 1 }, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.keyboardAvoidingView, { backgroundColor: theme.background }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Login to your account.</Text>
            <Text style={[styles.subtitle, { color: theme.subtitle }]}>Please sign in to your account</Text>

            <Text style={[styles.label, { color: theme.text }]}>Mobile number or Email</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                color: theme.text
              }]}
              placeholder="Mobile number or Email"
              placeholderTextColor={theme.placeholder}
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
            <View style={[styles.passwordContainer, { 
              backgroundColor: theme.inputBackground, 
              borderColor: theme.border 
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <MaterialIcons
                  name={passwordVisible ? "visibility-off" : "visibility"}
                  size={22}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={loginUser}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { borderBottomColor: theme.divider }]} />

            <Text style={[styles.footerText, { color: theme.text }]}>
              Don't have an account?{' '}
              <Link href="/Register" style={styles.registerLink}>Register</Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  signInButton: {
    backgroundColor: '#008CBA',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  divider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginVertical: 20
  },
  footerText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 14
  },
  registerLink: {
    color: '#007BFF',
    textDecorationLine: 'underline'
  }
});

export default Login;