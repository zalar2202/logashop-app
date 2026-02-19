import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStack } from './HomeStack';
import { ShopStack } from './ShopStack';
import { CartStack } from './CartStack';
import { AccountStack } from './AccountStack';
import { useCart } from '../contexts/CartContext';

export type MainTabsParamList = {
  Home: undefined;
  Shop: undefined;
  Cart: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabs() {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Home', headerShown: false }} />
      <Tab.Screen
        name="Shop"
        component={ShopStack}
        options={{ title: 'Shop', headerShown: false }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          title: 'Cart',
          headerShown: false,
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tab.Screen name="Account" component={AccountStack} options={{ title: 'Account', headerShown: false }} />
    </Tab.Navigator>
  );
}
