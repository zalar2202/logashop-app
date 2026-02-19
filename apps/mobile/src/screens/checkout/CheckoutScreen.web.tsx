import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function CheckoutScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout on mobile</Text>
      <Text style={styles.text}>
        Checkout with payments is only available in the iOS and Android app.
        Please use the mobile app to complete your purchase.
      </Text>
      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
