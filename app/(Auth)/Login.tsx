import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const Login = () => {
  return (
    <View>
      <Text>Login</Text>
      <Link href="/Register">
        <Text>Register</Text>
      </Link>
    </View>
  )
}

export default Login