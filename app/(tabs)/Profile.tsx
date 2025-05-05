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

const ProfileField = ({
  label,
  value,
  onChangeText,
  secure = false,
  isEditing,
  passwordVisible,
  togglePasswordVisibility,
}: any) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {isEditing ? (
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, secure && styles.passwordInput]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !passwordVisible}
        />
        {secure && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <MaterialIcons
              name={passwordVisible ? "visibility-off" : "visibility"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
    ) : (
      <View style={styles.fieldValueContainer}>
        <Text style={styles.fieldValue}>
          {secure ? (passwordVisible ? value : '•••••') : value}
        </Text>
        {secure && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <MaterialIcons
              name={passwordVisible ? "visibility-off" : "visibility"}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
    )}
  </View>
);

const Profile = () => {
  const { data,setData } = useAuth();

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

    const url = `${process.env.EXPO_PUBLIC_HOST}/updateUser/${userData?._id}`;
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

      // Update context
      // setData(updatedUser.data);

      // Store in AsyncStorage
    
      
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
      AsyncStorage.removeItem('cartItems'), // 
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../../assets/images/user2.gif')}
                style={styles.avatar}
                defaultSource={require('../../assets/images/avatar-placeholder.jpg')}
              />
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>{email}</Text>
            </View>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <MaterialIcons name="edit" size={18} color="#333" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={styles.formContainer}>
              <ProfileField
                label="Name"
                value={name}
                onChangeText={setName}
                isEditing={isEditing}
              />
              <ProfileField
                label="Email"
                value={email}
                onChangeText={setEmail}
                isEditing={false}

              />
              <ProfileField
                label="Address"
                value={address}
                onChangeText={setAddress}
                isEditing={isEditing}
              />
              <ProfileField
                label="Contact Number"
                value={contactNumber}
                onChangeText={setContactNumber}
                isEditing={isEditing}
              />
              <ProfileField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secure={true}
                isEditing={isEditing}
                passwordVisible={passwordVisible}
                togglePasswordVisibility={togglePasswordVisibility}
              />
            </View>

            {isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.signOutButton} onPress={showLogoutModal}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={hideLogoutModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={hideLogoutModal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalLogoutButton]}
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
    backgroundColor: '#f8f9fa',
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
    color: '#0096c7',
    fontWeight: '500',
  },
  profileContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 10,
    padding: 20,
    shadowColor: '#000',
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
    backgroundColor: '#e9ecef',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    marginBottom: 20,
  },
  editProfileText: {
    marginLeft: 5,
    fontWeight: '500',
    color: '#333',
  },
  formContainer: {
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#0096c7',
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    flex: 1,
    color: '#333',
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
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
    marginRight: 10,
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#0096c7',
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#333',
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
    color: '#dc3545',
    fontWeight: '500',
    fontSize: 16,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#0096c7',
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
    backgroundColor: 'white',
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
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
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
    backgroundColor: '#f1f3f5',
  },
  modalLogoutButton: {
    backgroundColor: '#dc3545',
  },
  modalCancelText: {
    color: '#333',
    fontWeight: '500',
  },
  modalLogoutText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default Profile;




<>

</>