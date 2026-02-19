import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/main/HomeScreen';
import { CategoriesScreen } from '../screens/main/CategoriesScreen';
import { ProductDetailScreen } from '../screens/main/ProductDetailScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  Categories: undefined;
  ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Home' }} />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
      />
    </Stack.Navigator>
  );
}
