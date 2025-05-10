import AuthProvider from '@/Providers/AuthProvider';
import CartProvider from '@/Providers/CartProvider';
import { NetworkProvider } from '@/Providers/NetworkProvider';
import { ThemeProvider } from '@/Providers/ThemeProvider';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <ThemeProvider>
    <NetworkProvider>
    <AuthProvider>
      <CartProvider>
      <Stack  screenOptions={{headerShown:false}}/>
      </CartProvider>
    </AuthProvider>
    </NetworkProvider>
    </ThemeProvider>
  );
}
