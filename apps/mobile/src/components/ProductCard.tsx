import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getApiBaseUrl } from '../api';
import type { Product } from '../api/catalog';
import { resolveImageUrl } from '../lib/utils';
import { PriceDisplay } from './PriceDisplay';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  isInWishlist?: boolean;
  onWishlistPress?: () => void;
  showAddToCart?: boolean;
  onAddToCart?: (e?: { stopPropagation?: () => void }) => void;
}

function getPrimaryImage(product: Product): string | null {
  const primary = product.images?.find((img) => img.isPrimary);
  const url = primary?.url ?? product.images?.[0]?.url;
  return resolveImageUrl(url ?? undefined, getApiBaseUrl());
}

export function ProductCard({
  product,
  onPress,
  isInWishlist = false,
  onWishlistPress,
  showAddToCart = false,
  onAddToCart,
}: ProductCardProps) {
  const imageUrl = getPrimaryImage(product);
  const hasDiscount =
    product.salePrice != null &&
    product.salePrice > 0 &&
    product.basePrice > product.salePrice;
  const displayPrice = hasDiscount ? product.salePrice! : product.basePrice;
  const categoryName =
    typeof product.categoryId === 'object' && product.categoryId != null
      ? (product.categoryId as { name?: string }).name
      : undefined;

  const handleWishlistPress = (e: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    onWishlistPress?.();
  };

  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#eee' }}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        {hasDiscount && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              -{Math.round((1 - product.salePrice! / product.basePrice) * 100)}%
            </Text>
          </View>
        )}
        {onWishlistPress && (
          <Pressable
            style={styles.wishlistBtn}
            onPress={handleWishlistPress}
            hitSlop={8}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={22}
              color={isInWishlist ? '#c00' : '#333'}
            />
          </Pressable>
        )}
      </View>
      <View style={styles.info}>
        {categoryName ? (
          <Text style={styles.category} numberOfLines={1}>
            {categoryName}
          </Text>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <PriceDisplay
          price={displayPrice}
          originalPrice={hasDiscount ? product.basePrice : undefined}
          size="small"
        />
        {typeof product.averageRating === 'number' &&
          product.averageRating >= 0 &&
          (product.reviewCount ?? 0) > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.ratingText}>
              {product.averageRating.toFixed(1)} ({product.reviewCount})
            </Text>
          </View>
        )}
        {showAddToCart && onAddToCart && (
          <Pressable
            style={styles.addToCartBtn}
            onPress={onAddToCart}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    margin: 4,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#c00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  addToCartBtn: {
    marginTop: 8,
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  info: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
});
