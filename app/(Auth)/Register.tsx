import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { Link, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const Register: React.FC = () => {
  const [agree, setAgree] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [Address, setAddress] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();
  const registerUser = () => {
    // Registration logic goes here
    if(!agree) {
      alert('Please agree to the terms and conditions');
      return;
    }
    if (!name || !email || !mobile || !Address || !password) {
      alert('Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      alert('Please enter a valid mobile number');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    // Simulate a successful registration
    console.log('User registered:', { name, email, mobile, Address, password });
    router.replace('/Login'); // Redirect to Login page after registration
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create your new account</Text>
      <Text style={styles.subtitle}>Create an account to start looking for the Product you like</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={mobile}
        onChangeText={setMobile}
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={Address}
        onChangeText={setAddress}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.checkboxContainer}>
        <Checkbox
          value={agree}
          onValueChange={setAgree}
        />
        <Text style={styles.checkboxText}>
          I Agree with <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>

      <TouchableOpacity style={styles.registerButton} disabled={!agree} onPress={registerUser}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>

      

      <Link href="/Login" style={styles.orText}>
        <Text style={styles.footerText}>Already have an account? <Text style={styles.signInLink}>Sign In</Text></Text>
      </Link>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 10,
    textAlign: 'center'
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    fontSize: 16
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 14,
    flexShrink: 1
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline'
  },
  registerButton: {
    backgroundColor: '#008CBA',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginTop: 20,
    width: '100%',
    alignItems: 'center'
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  orText: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    color: 'gray'
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%'
  },
  socialIcon: {
    marginHorizontal: 10,
    color: '#333'
  },
  footerText: {
    marginTop: 20,
    fontSize: 14,
    color: 'gray'
  },
  signInLink: {
    color: '#007BFF',
    textDecorationLine: 'underline'
  }
});

export default Register;
