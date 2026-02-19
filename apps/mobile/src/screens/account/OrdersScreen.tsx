import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as authStorage from '../../lib/authStorage';
import * as ordersApi from '../../api/orders';
import { PriceDisplay } from '../../components/PriceDisplay';
import { ErrorView } from '../../components/ErrorView';
import type { AccountStackParamList } from '../../navigation/AccountStack';

type NavProp = NativeStackNavigationProp<AccountStackParamList, 'Orders'>;

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function OrdersScreen() {
  const navigation = useNavigation<NavProp>();
  const [orders, setOrders] = useState<ordersApi.Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadOrders = useCallback(async (refresh = false) => {
    const p = refresh ? 1 : page;
    if (refresh) {
      setRefreshing(true);
      setOrders([]);
      setPage(1);
      setHasMore(true);
    } else if (p === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) throw new Error('Not authenticated');
      const res = await ordersApi.fetchOrders(token, { page: p, limit: 10 });
      if (refresh || p === 1) {
        setOrders(res.data);
      } else {
        setOrders((prev) => [...prev, ...res.data]);
      }
      setHasMore(res.pagination.page < res.pagination.pages);
      setPage(p + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      if (refresh) setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [page]);

  const loadOrdersRef = useRef(loadOrders);
  loadOrdersRef.current = loadOrders;

  useFocusEffect(
    useCallback(() => {
      loadOrdersRef.current?.(true);
    }, [])
  );

  const handleOrderPress = (order: ordersApi.Order) => {
    navigation.navigate('OrderDetail', { orderId: order._id });
  };

  const handleRetry = () => loadOrders(true);

  if (loading && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && orders.length === 0) {
    return <ErrorView message={error} onRetry={handleRetry} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadOrders(true)} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
          </View>
        }
        onEndReached={() => {
          if (!loadingMore && hasMore && orders.length > 0) {
            loadOrders(false);
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.btnPressed]}
            onPress={() => handleOrderPress(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusValue}>{item.status}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <PriceDisplay price={item.total} size="small" />
            </View>
          </Pressable>
        )}
      />
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
    paddingBottom: 32,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  btnPressed: {
    opacity: 0.7,
  },
  footerLoader: {
    padding: 16,
    alignItems: 'center',
  },
});
