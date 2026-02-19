import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import * as ordersApi from '../../api/orders';
import { PriceDisplay } from '../../components/PriceDisplay';
import { getApiBaseUrl } from '../../api';
import { resolveImageUrl } from '../../lib/utils';

export function GuestTrackingScreen() {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState<ordersApi.Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    const code = trackingCode.trim();
    if (!code) {
      setError('Enter your tracking code');
      return;
    }
    setError(null);
    setOrder(null);
    setLoading(true);
    try {
      const o = await ordersApi.fetchOrderByTrackingCode(code);
      setOrder(o);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTrackingCode('');
    setOrder(null);
    setError(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!order ? (
        <>
          <Text style={styles.title}>Track your order</Text>
          <Text style={styles.subtitle}>
            Enter the tracking code from your order confirmation email
          </Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={trackingCode}
            onChangeText={(v) => {
              setTrackingCode(v);
              setError(null);
            }}
            placeholder="Tracking code"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!loading}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={handleLookup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>Look up order</Text>
            )}
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={styles.statusValue}>{order.status}</Text>
            </View>
          </View>

          {order.trackingCode && (
            <View style={styles.trackingCard}>
              <Text style={styles.trackingTitle}>Tracking code</Text>
              <Text style={styles.trackingCode}>{order.trackingCode}</Text>
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

          <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.btnPressed]} onPress={handleReset}>
            <Text style={styles.secondaryBtnText}>Look up another order</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#c00',
  },
  errorText: {
    fontSize: 14,
    color: '#c00',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.7,
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
    fontFamily: 'monospace',
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
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginTop: 24,
  },
  secondaryBtnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
