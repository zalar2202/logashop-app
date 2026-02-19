import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShopScreen } from '../screens/main/ShopScreen';
import { ProductDetailScreen } from '../screens/main/ProductDetailScreen';

export type ShopStackParamList = {
  ShopMain: { categoryId?: string; categoryName?: string } | undefined;
  ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<ShopStackParamList>();

export function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="ShopMain"
        component={ShopScreen}
        options={({ route }) => ({
          title: route.params?.categoryName ?? 'Shop',
        })}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
      />
    </Stack.Navigator>
  );
}
