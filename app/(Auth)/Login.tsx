import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Link, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const router =useRouter();
  const LoginUser = () => {
    // Login logic goes here
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
    // Simulate a successful login

    console.log('User logged in:', { identifier, password });
    // Redirect to the home page or dashboard after login

    router.replace('/Home'); // Uncomment this line to redirect after login
  }
  return (
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
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />


      <TouchableOpacity style={styles.signInButton} onPress={LoginUser}>
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.footerText}>
        Don't have an account?{' '}
        <Link href="/Register" style={styles.registerLink}>Register</Link>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center'
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
  forgotPassword: {
    color: '#007BFF',
    alignSelf: 'flex-end',
    marginBottom: 24
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
