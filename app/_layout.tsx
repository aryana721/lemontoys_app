import AuthProvider from '@/Providers/AuthProvider';
import CartProvider from '@/Providers/CartProvider';
import { NetworkProvider } from '@/Providers/NetworkProvider';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <NetworkProvider>
    <AuthProvider>
      <CartProvider>
      <Stack  screenOptions={{headerShown:false}}/>
      </CartProvider>
    </AuthProvider>
    </NetworkProvider>
  );
}
