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
        Platform
      } from 'react-native';
      import Checkbox from 'expo-checkbox';
      import { Link, useRouter } from 'expo-router';
      import axios from 'axios';
      import { FontAwesome } from '@expo/vector-icons'; // or use Feather / Ionicons

      const { width } = Dimensions.get('window');

      const Register: React.FC = () => {
        const [agree, setAgree] = useState<boolean>(false);
        const [name, setName] = useState<string>('');
        const [email, setEmail] = useState<string>('');
        const [mobile, setMobile] = useState<string>('');
        const [address, setAddress] = useState<string>('');
        const [password, setPassword] = useState<string>('');
        const [loading, setLoading] = useState<boolean>(false);
          const [isSecure, setIsSecure] = useState(true);
        
        const router = useRouter();
        
        const registerUser = () => {
          // Registration logic goes here
          let url = `${process.env.EXPO_PUBLIC_HOST}/register`;
          setLoading(true);
          if (!agree) {
            alert('Please agree to the terms and conditions');
            setLoading(false);
            return;
          }
          if (!name || !email || !mobile || !address || !password) {
            alert('Please fill in all fields');
            setLoading(false);
            return;
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address');
            setLoading(false);                                                        
            return;
          }
          if (!/^\d{10}$/.test(mobile)) {
            alert('Please enter a valid mobile number');
            setLoading(false);
            return;
          }
          if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            setLoading(false);
            return;
          }
          let Data = {
            name: name,
            email: email,
            mobileNumber: mobile,
            address: address,
            password: password
          }
          axios.post(url, Data)
            .then(function (response) {
              
              setLoading(false);
              alert('User Created Successfully.');
              router.replace('/Login'); // Redirect to Login page after registration
            })
            .catch(function (error) {
              console.log(error);
              setLoading(false);
              // Handle error response here
              if (error.response && error.response.status === 400) {
                alert('User already exists. Please login.');
              } else {
                alert('Registration failed. Please try again later.');
              }
            });
        };
        
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}  
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.container}>
                <Text style={styles.title}>Create your new account</Text>
                <Text style={styles.subtitle}>Create an account to start looking for the Product you like</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your 10-digit phone number"
                    keyboardType="phone-pad"
                    value={mobile}
                    onChangeText={setMobile}
                    maxLength={10}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your delivery address"
                    value={address}
                    onChangeText={setAddress}
                    multiline={true}
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
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
                </View>

                <View style={styles.checkboxContainer}>
                  <Checkbox
                    value={agree}
                    onValueChange={setAgree}
                    color={agree ? '#008CBA' : undefined}
                  />
                  <Text style={styles.checkboxText}>
                    I Agree with <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.registerButton, (!agree || loading) && styles.disabledButton]}
                  disabled={!agree || loading}
                  onPress={registerUser}
                >
                  {
                    loading
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.registerText}>Register</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity>
                  <Link href="/Login" style={styles.loginLinkContainer}>
                    <Text style={styles.footerText}>
                      Already have an account? <Text style={styles.signInLink}>Sign In</Text>
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
          marginBottom: 16,
          height: 48,
        },
        
        passwordInput: {
          flex: 1,
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