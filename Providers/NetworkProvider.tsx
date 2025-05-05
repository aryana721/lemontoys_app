import React, { useEffect, useState, createContext, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { View, Text, StyleSheet } from 'react-native';

const NetworkContext = createContext(true);

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }:any) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={isConnected}>
      <View style={{ flex: 1 }}>
        {!isConnected && (
          <View style={styles.banner}>
            <Text style={styles.text}>No Internet Connection</Text>
          </View>
        )}
        {children}
      </View>
    </NetworkContext.Provider>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ff3333',
    padding: 10,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
