import { View, Text, Button } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

const Register = () => {
  const router  = useRouter();
  return (
    <View>
      <Text>Register</Text>
      <Button title="Submit" onPress={() => {
        console.log('Submit')
        // setIsReady(true);
        // AsyncStorage.setItem('user', 'true');
        // setIsLoggedIn(true);
        router.replace('/Home');
      }} />
    </View>
  )
}

export default Register