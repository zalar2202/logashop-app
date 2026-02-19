import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as authStorage from '../../lib/authStorage';
import * as addressesApi from '../../api/addresses';
import type { Address } from '../../api/addresses';
import { ErrorView } from '../../components/ErrorView';
import type { AccountStackParamList } from '../../navigation/AccountStack';

type NavProp = NativeStackNavigationProp<AccountStackParamList, 'Addresses'>;

function formatAddressShort(addr: Address): string {
  return [addr.address1, addr.city, addr.state].filter(Boolean).join(', ');
}

export function AddressesScreen() {
  const navigation = useNavigation<NavProp>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAddresses = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) throw new Error('Not authenticated');
      const list = await addressesApi.fetchAddresses(token);
      setAddresses(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

  const handleAdd = () => {
    navigation.navigate('AddressForm', {});
  };

  const handleEdit = (address: Address) => {
    navigation.navigate('AddressForm', { address });
  };

  const handleDelete = (address: Address) => {
    Alert.alert(
      'Delete address',
      `Delete this address?\n${formatAddressShort(address)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(address._id);
            try {
              const token = (await authStorage.getTokens())?.accessToken;
              if (!token) return;
              await addressesApi.deleteAddress(address._id, token);
              await loadAddresses();
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;
    setActionLoading(address._id);
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) return;
      await addressesApi.setDefaultAddress(address._id, token);
      await loadAddresses();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to set default');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && addresses.length === 0) {
    return <ErrorView message={error} onRetry={() => loadAddresses()} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={addresses.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadAddresses(true)} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptySubtitle}>Add an address for faster checkout</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.label ? (
              <Text style={styles.cardLabel}>{item.label}</Text>
            ) : null}
            <Text style={styles.cardName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.cardAddress}>{formatAddressShort(item)}</Text>
            {item.isDefault ? (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            ) : null}
            <View style={styles.cardActions}>
              {!item.isDefault ? (
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
                  onPress={() => handleSetDefault(item)}
                  disabled={actionLoading === item._id}
                >
                  {actionLoading === item._id ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text style={styles.actionBtnText}>Set default</Text>
                  )}
                </Pressable>
              ) : null}
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.actionBtnText}>Edit</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.actionBtn, styles.deleteBtn, pressed && styles.btnPressed]}
                onPress={() => handleDelete(item)}
                disabled={actionLoading === item._id}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.addBtn, pressed && styles.btnPressed]} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+ Add address</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
    padding: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  actionBtnText: {
    fontSize: 14,
    color: '#007AFF',
  },
  deleteBtn: {},
  deleteBtnText: {
    fontSize: 14,
    color: '#c00',
  },
  btnPressed: {
    opacity: 0.7,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addBtn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
