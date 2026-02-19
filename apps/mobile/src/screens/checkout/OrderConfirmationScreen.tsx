import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as authStorage from '../../lib/authStorage';
import * as ordersApi from '../../api/orders';
import { PriceDisplay } from '../../components/PriceDisplay';
import { getApiBaseUrl } from '../../api';
import { resolveImageUrl } from '../../lib/utils';
import type { CartStackParamList } from '../../navigation/CartStack';

type Props = NativeStackScreenProps<CartStackParamList, 'OrderConfirmation'>;
type NavProp = NativeStackNavigationProp<CartStackParamList, 'OrderConfirmation'>;

export function OrderConfirmationScreen({ route }: Props) {
  const { orderId, orderNumber } = route.params;
  const navigation = useNavigation<NavProp>();
  const [order, setOrder] = useState<ordersApi.Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = (await authStorage.getTokens())?.accessToken;
        if (token) {
          const o = await ordersApi.fetchOrderById(orderId, token);
          setOrder(o);
        }
      } catch {
        // Show order number even if fetch fails
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const resetToCart = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'CartMain' }] });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      return () => resetToCart();
    }, [resetToCart])
  );

  const handleContinueShopping = () => {
    resetToCart();
    const tabNav = navigation.getParent();
    if (tabNav && 'navigate' in tabNav) {
      (tabNav as { navigate: (n: string) => void }).navigate('Home');
    }
  };

  const copyTrackingCode = () => {
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successHeader}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Order confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Thank you for your order
          {orderNumber && (
            <Text style={styles.orderNumber}> #{orderNumber}</Text>
          )}
        </Text>
      </View>

      {order?.trackingCode && (
        <View style={styles.trackingCard}>
          <Text style={styles.trackingTitle}>Tracking code</Text>
          <Text style={styles.trackingCode}>{order.trackingCode}</Text>
          <Pressable style={styles.copyBtn} onPress={copyTrackingCode}>
            <Text style={styles.copyBtnText}>Share</Text>
          </Pressable>
        </View>
      )}

      {order && (
        <>
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
            <Text style={styles.totalLabel}>Total paid</Text>
            <PriceDisplay price={order.total} size="large" />
          </View>
        </>
      )}

      <Pressable style={styles.continueBtn} onPress={handleContinueShopping}>
        <Text style={styles.continueBtnText}>Continue shopping</Text>
      </Pressable>
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
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
    color: '#0a0',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  orderNumber: {
    fontWeight: '600',
    color: '#333',
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
  copyBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  copyBtnText: {
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
    gap: 12,
  },
  itemImagePlaceholder: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
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
  continueBtn: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
