import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountScreen } from '../screens/main/AccountScreen';
import { ProfileScreen } from '../screens/account/ProfileScreen';
import { AddressesScreen } from '../screens/account/AddressesScreen';
import { AddressFormScreen } from '../screens/account/AddressFormScreen';
import { OrdersScreen } from '../screens/account/OrdersScreen';
import { OrderDetailScreen } from '../screens/account/OrderDetailScreen';
import { GuestTrackingScreen } from '../screens/account/GuestTrackingScreen';
import { WishlistScreen } from '../screens/account/WishlistScreen';
import { DownloadsScreen } from '../screens/account/DownloadsScreen';
import { NotificationsScreen } from '../screens/account/NotificationsScreen';

export type AccountStackParamList = {
  AccountHome: undefined;
  Profile: undefined;
  Addresses: undefined;
  AddressForm: { address?: import('../api/addresses').Address };
  Orders: undefined;
  OrderDetail: { orderId: string };
  GuestTracking: undefined;
  Wishlist: undefined;
  Downloads: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<AccountStackParamList>();

export function AccountStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="AccountHome"
        component={AccountScreen}
        options={{ title: 'Account' }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'Addresses' }} />
      <Stack.Screen
        name="AddressForm"
        component={AddressFormScreen}
        options={{ title: 'Address' }}
      />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Order history' }} />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order detail' }}
      />
      <Stack.Screen
        name="GuestTracking"
        component={GuestTrackingScreen}
        options={{ title: 'Track order' }}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ title: 'My Wishlist' }}
      />
      <Stack.Screen
        name="Downloads"
        component={DownloadsScreen}
        options={{ title: 'My Downloads' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}
