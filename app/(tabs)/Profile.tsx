import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@/Providers/AuthProvider';
import axios from 'axios';
import { useCart } from '@/Providers/CartProvider';
import { useNetwork } from '@/Providers/NetworkProvider';
import { useTheme } from '@/Providers/ThemeProvider';

export const ProfileField = ({
  label,
  value,
  onChangeText,
  secure = false,
  isEditing,
  passwordVisible,
  togglePasswordVisibility,
  theme,
}: any) => (
  <View style={styles.fieldContainer}>
    <Text style={[styles.fieldLabel, { color: theme.text }]}>{label}</Text>
    {isEditing ? (
      <View style={[styles.inputContainer, { borderBottomColor: theme.primary }]}>
        <TextInput
          style={[styles.input, secure && styles.passwordInput, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !passwordVisible}  
          placeholderTextColor={theme.secondary}
        />
        {secure && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <MaterialIcons
              name={passwordVisible ? "visibility-off" : "visibility"}
              size={22}
              color={theme.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    ) : (
      <View style={[styles.fieldValueContainer, { borderBottomColor: theme.border }]}>
        <Text style={[styles.fieldValue, { color: theme.text }]}>
          {secure ? (passwordVisible ? value : '•••••') : value}
        </Text>
        {secure && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <MaterialIcons
              name={passwordVisible ? "visibility-off" : "visibility"}
              size={22}
              color={theme.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);

const Profile = () => {
  const { data, setData } = useAuth();
  const isConnected = useNetwork();
  const theme = useTheme(); // Using the theme from your ThemeProvider

  const userData = typeof data === 'string' ? JSON.parse(data) : data;

  const [name, setName] = useState(userData?.name || 'Guest User');
  const [email, setEmail] = useState(userData?.email?.toString() || '');
  const [address, setAddress] = useState(userData?.address || '');
  const [contactNumber, setContactNumber] = useState(userData?.phone?.toString() || '');
  const [password, setPassword] = useState(userData?.password || '');
  const [isEditing, setIsEditing] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  
  const handleSave = async () => {
    // Input validation
    if (!name || !email || !address || !contactNumber || !password) {
      alert('Please fill in all fields.');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      alert('Please enter a valid contact number.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    const url = `https://lemontoys-server.vercel.app/updateUser/${userData?._id}`;
    const updatedData = {
      name,
      email,
      address,
      phone: contactNumber,
      password,
    };

    try {
      const response = await axios.post(url, updatedData);
      const updatedUser = response.data.data;
      
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      alert('Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
      alert('Failed to update profile. Please try again later.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const showLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const hideLogoutModal = () => {
    setLogoutModalVisible(false);
  };

  const signout = () => {
    hideLogoutModal();
  
    Promise.all([
      AsyncStorage.removeItem('userData'),
      AsyncStorage.removeItem('cartItems'), 
    ])
      .then(() => {
        setData(null);
        router.replace('/Login');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };
  
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {!isConnected ? (
      <View style={[styles.noInternetContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.noInternetText, { color: theme.error }]}>No Internet Connection</Text>
      </View>
    ):(
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={[styles.profileContainer, { backgroundColor: theme.card, shadowColor: theme.text }]}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/images/user2.gif')}
                style={styles.avatar}
                defaultSource={require('../../assets/images/avatar-placeholder.jpg')}
              />
              <Text style={[styles.userName, { color: theme.text }]}>{name}</Text>
              <Text style={[styles.userEmail, { color: theme.secondary }]}>{email}</Text>
            </View>

            <TouchableOpacity
              style={[styles.editProfileButton, { backgroundColor: theme.secondary }]}
              onPress={() => setIsEditing(!isEditing)}
            >
              <MaterialIcons name="edit" size={18} color={theme.text} />
              <Text style={[styles.editProfileText, { color: theme.text }]}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={styles.formContainer}>
              <ProfileField
                label="Name"
                value={name}
                onChangeText={setName}
                isEditing={isEditing}
                theme={theme}
              />
              <ProfileField
                label="Email"
                value={email}
                onChangeText={setEmail}
                isEditing={false}
                theme={theme}
              />
              <ProfileField
                label="Address"
                value={address}
                onChangeText={setAddress}
                isEditing={isEditing}
                theme={theme}
              />
              <ProfileField
                label="Contact Number"
                value={contactNumber}
                onChangeText={setContactNumber}
                isEditing={isEditing}
                theme={theme}
              />
              <ProfileField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secure={true}
                isEditing={isEditing}
                passwordVisible={passwordVisible}
                togglePasswordVisibility={togglePasswordVisibility}
                theme={theme}
              />
            </View>

            {isConnected && isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.cancelButton, { backgroundColor: theme.secondary }]} 
                  onPress={handleCancel}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: theme.primary }]} 
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.signOutButton} onPress={showLogoutModal}>
              <Text style={[styles.signOutText, { color: theme.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>)}

      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={hideLogoutModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm Logout</Text>
            <Text style={[styles.modalMessage, { color: theme.secondary }]}>Are you sure you want to logout?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton, { backgroundColor: theme.secondary }]}
                onPress={hideLogoutModal}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalLogoutButton, { backgroundColor: theme.error }]}
                onPress={signout}
              >
                <Text style={styles.modalLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noInternetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noInternetText: {
    fontSize: 18,
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  profileContainer: {
    borderRadius: 15,
    margin: 10,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  editProfileText: {
    marginLeft: 5,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  fieldValue: {
    fontSize: 16,
    paddingVertical: 10,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    flex: 1,
  },
  passwordInput: {
    paddingRight: 40, // Make room for the eye icon
  },
  eyeIcon: {
    padding: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  signOutButton: {
    padding: 15,
    alignItems: 'center',
  },
  signOutText: {
    fontWeight: '500',
    fontSize: 16,
  },
  bottomTabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalCancelButton: {
  },
  modalLogoutButton: {
  },
  modalCancelText: {
    fontWeight: '500',
  },
  modalLogoutText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default Profile;