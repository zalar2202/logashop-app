import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProviderWrapper } from './src/components/StripeProviderWrapper';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { WishlistProvider } from './src/contexts/WishlistContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setNotificationHandler } from './src/hooks/usePushNotifications';
import { PushNotificationRegistrar } from './src/components/PushNotificationRegistrar';

setNotificationHandler();

const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export default function App() {
  return (
    <SafeAreaProvider>
      <StripeProviderWrapper publishableKey={stripePublishableKey}>
        <AuthProvider>
          <PushNotificationRegistrar />
          <CartProvider>
            <WishlistProvider>
              <NavigationContainer>
              <RootNavigator />
              <StatusBar style="auto" />
              </NavigationContainer>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </StripeProviderWrapper>
    </SafeAreaProvider>
  );
}
