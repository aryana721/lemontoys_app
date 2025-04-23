import { Redirect } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
    //   const user = await AsyncStorage.getItem('user');
    //   setIsLoggedIn(!!user);
      setIsReady(false);
    };
    checkLogin();
  }, []);

//   if (!isReady) return null;

  return <Redirect href={isLoggedIn ? '/(tabs)' : '/Login'} />;
}