import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useColorScheme
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { Link, useRouter } from 'expo-router';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { useNetwork } from '@/Providers/NetworkProvider';

const { width } = Dimensions.get('window');

const Register: React.FC = () => {
  const [agree, setAgree] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const isConnected = useNetwork();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateInputs = () => {
    if (!agree) {
      alert('Please agree to the terms and conditions');
      return false;
    }
    
    if (!name || !email || !mobile || !address || !password) {
      alert('Please fill in all fields');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    if (!/^\d{10}$/.test(mobile)) {
      alert('Please enter a valid mobile number');
      return false;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const registerUser = () => {
    Keyboard.dismiss();
    
    if (!validateInputs()) {
      return;
    }

    if (!isConnected) {
      alert('Please check your internet connection');
      return;
    }

    const url = `https://lemontoys-server.vercel.app/register`;
    setLoading(true);
    
    const userData = {
      name: name,
      email: email,
      mobileNumber: mobile,
      address: address,
      password: password
    };
    
    axios.post(url, userData)
      .then(function (response) {
        alert('User Created Successfully.');
        router.replace('/Login'); // Redirect to Login page after registration
      })
      .catch(function (error) {
        console.log(error);
        // Handle error response here
        if (error.response && error.response.status === 400) {
          alert('User already exists. Please login.');
        } else {
          alert('Registration failed. Please try again later.');
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
    checkboxText: isDarkMode ? '#CCCCCC' : '#333333',
    link: '#007BFF',
    disabledButton: isDarkMode ? '#333333' : '#CCCCCC'
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardAvoidingView, { backgroundColor: theme.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}  
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Text style={[styles.title, { color: theme.text }]}>Create your new account</Text>
          <Text style={[styles.subtitle, { color: theme.subtitle }]}>Create an account to start looking for the Product you like</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                color: theme.text 
              }]}
              placeholder="Enter your full name"
              placeholderTextColor={theme.placeholder}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                color: theme.text 
              }]}
              placeholder="Enter your email address"
              placeholderTextColor={theme.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                color: theme.text 
              }]}
              placeholder="Enter your 10-digit phone number"
              placeholderTextColor={theme.placeholder}
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Address</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                color: theme.text 
              }]}
              placeholder="Enter your delivery address"
              placeholderTextColor={theme.placeholder}
              value={address}
              onChangeText={setAddress}
              multiline={true}
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Password</Text>
            <View style={[styles.passwordContainer, { 
              backgroundColor: theme.inputBackground, 
              borderColor: theme.border 
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: theme.text }]}
                placeholder="Enter your password"
                placeholderTextColor={theme.placeholder}
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <MaterialIcons
                  name={passwordVisible ? "visibility-off" : "visibility"}
                  size={22}
                  color={theme.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              value={agree}
              onValueChange={setAgree}
              color={agree ? theme.primary : undefined}
            />
            <Text style={[styles.checkboxText, { color: theme.checkboxText }]}>
              I Agree with <Text style={[styles.link, { color: theme.link }]}>Terms of Service</Text> and <Text style={[styles.link, { color: theme.link }]}>Privacy Policy</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton, 
              (!agree || loading) && [styles.disabledButton, { backgroundColor: theme.disabledButton }]
            ]}
            disabled={!agree || loading}
            onPress={registerUser}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.registerText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity>
            <Link href="/Login" style={styles.loginLinkContainer}>
              <Text style={[styles.footerText, { color: theme.text }]}>
                Already have an account? <Text style={[styles.signInLink, { color: theme.link }]}>Sign In</Text>
              </Text>
            </Link>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 14,
    flexShrink: 1,
    color: '#333',
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#008CBA',
    borderRadius: 30,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  signInLink: {
    color: '#007BFF',
    fontWeight: '600',
  }
});

export default Register;