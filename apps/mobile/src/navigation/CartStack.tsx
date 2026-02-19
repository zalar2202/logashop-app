import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartScreen } from '../screens/main/CartScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrderConfirmationScreen } from '../screens/checkout/OrderConfirmationScreen';

export type CartStackParamList = {
  CartMain: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string; orderNumber: string };
};

const Stack = createNativeStackNavigator<CartStackParamList>();

export function CartStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="CartMain" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ title: 'Order Confirmed', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
