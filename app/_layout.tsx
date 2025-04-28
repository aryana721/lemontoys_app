import AuthProvider from '@/Providers/AuthProvider';
import CartProvider from '@/Providers/CartProvider';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
      <Stack  screenOptions={{headerShown:false}}/>
      </CartProvider>
    </AuthProvider>
  );
}
