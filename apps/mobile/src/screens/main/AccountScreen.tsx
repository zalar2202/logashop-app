import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import type { AccountStackParamList } from '../../navigation/AccountStack';

type NavProp = NativeStackNavigationProp<AccountStackParamList, 'AccountHome'>;

const MENU_ITEM = {
  Profile: 'Profile',
  Addresses: 'Addresses',
  Orders: 'Orders',
  Wishlist: 'Wishlist',
  Downloads: 'Downloads',
  Notifications: 'Notifications',
} as const;

export function AccountScreen() {
  const navigation = useNavigation<NavProp>();
  const { user, logout } = useAuth();

  const handleSignIn = () => {
    (navigation as unknown as { navigate: (name: string, params?: { screen: string }) => void }).navigate('Auth', { screen: 'Login' });
  };

  const handleSignUp = () => {
    (navigation as unknown as { navigate: (name: string, params?: { screen: string }) => void }).navigate('Auth', { screen: 'Signup' });
  };

  const handleTrackOrder = () => {
    navigation.navigate('GuestTracking');
  };

  const handleMenuItem = (screen: keyof typeof MENU_ITEM) => {
    navigation.navigate(screen);
  };

  if (!user) {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.guestContainer}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.subtitle}>Sign in to manage your account and orders</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
          onPress={handleSignIn}
        >
          <Text style={styles.primaryBtnText}>Sign in</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]}
          onPress={handleSignUp}
        >
          <Text style={styles.secondaryBtnText}>Create account</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          style={({ pressed }) => [styles.guestMenuItem, pressed && styles.btnPressed]}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <Text style={styles.guestMenuItemText}>My Wishlist</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </Pressable>
        <Text style={styles.trackTitle}>Guest checkout?</Text>
        <Text style={styles.trackSubtitle}>Track your order with your tracking code</Text>
        <Pressable
          style={({ pressed }) => [styles.trackBtn, pressed && styles.btnPressed]}
          onPress={handleTrackOrder}
        >
          <Text style={styles.trackBtnText}>Track your order</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Hello, {user.name || user.email}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.menu}>
        <Pressable
          style={({ pressed }) => [styles.menuItem, pressed && styles.btnPressed]}
          onPress={() => handleMenuItem('Profile')}
        >
          <Text style={styles.menuItemText}>Profile</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.menuItem, pressed && styles.btnPressed]}
          onPress={() => handleMenuItem('Addresses')}
        >
          <Text style={styles.menuItemText}>Addresses</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.menuItem, pressed && styles.btnPressed]}
          onPress={() => handleMenuItem('Orders')}
        >
          <Text style={styles.menuItemText}>Order history</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.menuItem, pressed && styles.btnPressed]}
          onPress={() => handleMenuItem('Wishlist')}
        >
          <Text style={styles.menuItemText}>My Wishlist</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.menuItem, pressed && styles.btnPressed]}
          onPress={() => handleMenuItem('Downloads')}
        >
          <Text style={styles.menuItemText}>My Downloads</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.menuItem, pressed && styles.btnPressed]}
          onPress={() => handleMenuItem('Notifications')}
        >
          <Text style={styles.menuItemText}>Notifications</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]}
        onPress={logout}
      >
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  menu: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#999',
  },
  primaryBtn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  guestMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 280,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  guestMenuItemText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#eee',
    marginVertical: 32,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  trackSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  trackBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  trackBtnText: {
    fontSize: 15,
    color: '#333',
  },
  btnPressed: {
    opacity: 0.7,
  },
  logoutBtn: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  logoutText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
