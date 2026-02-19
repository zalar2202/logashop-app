import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatPrice } from '../lib/utils';

interface PriceDisplayProps {
  /** Price in cents */
  price: number;
  /** Original price in cents (for sale strikethrough) */
  originalPrice?: number;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

export function PriceDisplay({ price, originalPrice, size = 'medium' }: PriceDisplayProps) {
  const hasDiscount = originalPrice != null && originalPrice > price;
  const priceStyle = size === 'small' ? styles.priceSmall : size === 'large' ? styles.priceLarge : styles.price;

  return (
    <View style={styles.container}>
      <Text style={[priceStyle, styles.currentPrice]}>{formatPrice(price)}</Text>
      {hasDiscount ? (
        <Text style={[priceStyle, styles.originalPrice]}>{formatPrice(originalPrice)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceLarge: {
    fontSize: 20,
    fontWeight: '700',
  },
  currentPrice: {
    color: '#333',
  },
  originalPrice: {
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
});
