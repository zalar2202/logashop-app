import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Share,
  Platform,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as authStorage from '../../lib/authStorage';
import * as ordersApi from '../../api/orders';
import { PriceDisplay } from '../../components/PriceDisplay';
import { ErrorView } from '../../components/ErrorView';
import { getApiBaseUrl } from '../../api';
import { resolveImageUrl } from '../../lib/utils';
import type { AccountStackParamList } from '../../navigation/AccountStack';

type Props = NativeStackScreenProps<AccountStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<ordersApi.Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = (await authStorage.getTokens())?.accessToken;
      if (!token) throw new Error('Not authenticated');
      const o = await ordersApi.fetchOrderById(orderId, token);
      setOrder(o);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleShareTracking = () => {
    if (order?.trackingCode && Platform.OS !== 'web') {
      Share.share({
        message: `Order ${order.orderNumber} - Tracking: ${order.trackingCode}`,
        title: 'Order tracking',
      }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !order) {
    return <ErrorView message={error ?? 'Order not found'} onRetry={loadOrder} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusValue}>{order.status}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Payment:</Text>
          <Text style={styles.statusValue}>{order.paymentStatus}</Text>
        </View>
      </View>

      {order.trackingCode && (
        <View style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Tracking code</Text>
          <Text style={styles.trackingCode}>{order.trackingCode}</Text>
          <Pressable style={styles.shareBtn} onPress={handleShareTracking}>
            <Text style={styles.shareBtnText}>Share</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order details</Text>
        {order.items.map((item, idx) => {
          const baseUrl = getApiBaseUrl();
          const imageUrl = resolveImageUrl(item.image ?? undefined, baseUrl);
          return (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemImagePlaceholder}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.variantInfo && Object.keys(item.variantInfo).length > 0 && (
                  <Text style={styles.itemVariant} numberOfLines={1}>
                    {Object.entries(item.variantInfo)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                  </Text>
                )}
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <PriceDisplay price={item.lineTotal} size="small" />
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping address</Text>
        <Text style={styles.addressText}>
          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          {'\n'}
          {order.shippingAddress.address1}
          {order.shippingAddress.address2
            ? `, ${order.shippingAddress.address2}`
            : ''}
          {'\n'}
          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
          {order.shippingAddress.zipCode}
        </Text>
      </View>

      <View style={styles.totalsRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <PriceDisplay price={order.total} size="large" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  trackingCard: {
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#ffe58f',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  trackingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ad8b00',
    marginBottom: 8,
  },
  trackingCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  shareBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  shareBtnText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  itemVariant: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  itemQty: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
