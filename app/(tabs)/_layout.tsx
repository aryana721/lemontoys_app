import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {  Tabs } from 'expo-router';


import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useCart } from '@/Providers/CartProvider';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const {CartItems} = useCart();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,

        headerShown: useClientOnlyValue(false, true),
      }}>
      
      <Tabs.Screen
        name="Search"
        options={{
          title: 'Search',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome
          name="search"
          size={25}
          color={Colors[colorScheme ?? 'light'].text}/>,
        }}
      />
      <Tabs.Screen
        name="Cart"
        options={{
          title: 'Cart',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome
          name="shopping-cart"
          size={25}
          color={Colors[colorScheme ?? 'light'].text}
        />,
          tabBarBadge: CartItems.length > 0 ? CartItems.length : undefined,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome
          name="user"
          size={25}
          color={Colors[colorScheme ?? 'light'].text}
       
        />,
        }}
      />
    </Tabs>
  );
}
