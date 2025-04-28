import React, { useState } from 'react';
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
  Keyboard
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons'; // or use Feather / Ionicons
import { useAuth } from '@/Providers/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type data = {
  identifier: string,
  password: string
};

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isSecure, setIsSecure] = useState(true);
  const {setData} =useAuth();
  const LoginUser = () => {
    Keyboard.dismiss();
    if (!identifier || !password) {
      alert('Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) && !/^\d{10}$/.test(identifier)) {
      alert('Please enter a valid email address or mobile number');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    const url = `${process.env.EXPO_PUBLIC_HOST}/login`;
    const Data: data = {
      identifier,
      password
    };

    setLoading(true);

    axios.post(url, Data)
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
          });
      } else {
        console.warn('No user data returned from login response.');
      }
  
      setLoading(false);
    })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
        if (error.response?.status === 400) {
          alert('User not found.');
        } else if (error.response?.status === 403) {
          alert(error.response.data.message);
        } else {
          alert('Login failed. Please try again later.');
        }
      });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Login to your account.</Text>
          <Text style={styles.subtitle}>Please sign in to your account</Text>

          <Text style={styles.label}>Mobile number or Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile number or Email"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={isSecure}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
              <FontAwesome
                name={isSecure ? 'eye-slash' : 'eye'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>


          <TouchableOpacity
            style={styles.signInButton}
            onPress={LoginUser}
            disabled={loading}
          >
            {
              loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )
            }
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.footerText}>
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
  },

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