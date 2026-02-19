import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchProduct, fetchProductVariants } from '../../api/catalog';
import type { Product, ProductVariant } from '../../api/catalog';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { getApiBaseUrl } from '../../api';
import { resolveImageUrl } from '../../lib/utils';
import { PriceDisplay } from '../../components/PriceDisplay';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';
import { ProductReviews } from '../../components/product/ProductReviews';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'ProductDetail'>;

function getPrimaryImage(product: Product): string | null {
  const primary = product.images?.find((img) => img.isPrimary);
  const url = primary?.url ?? product.images?.[0]?.url;
  return resolveImageUrl(url ?? undefined, getApiBaseUrl());
}

export function ProductDetailScreen({ navigation, route }: Props) {
  const { productId } = route.params;
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, variantsData] = await Promise.all([
        fetchProduct(productId),
        fetchProductVariants(productId),
      ]);
      setProduct(prodData);
      setVariants(variantsData);
      setSelectedVariant(variantsData.length > 0 ? variantsData[0] : null);
      navigation.setOptions({ title: prodData.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
      setProduct(null);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (loading && !product) {
    return <LoadingSpinner />;
  }

  if (error && !product) {
    return <ErrorView message={error} onRetry={loadProduct} />;
  }

  if (!product) {
    return <ErrorView message="Product not found" />;
  }

  const imageUrl = getPrimaryImage(product);
  const hasDiscount =
    product.salePrice != null &&
    product.salePrice > 0 &&
    product.basePrice > product.salePrice;

  const displayPrice = (() => {
    if (selectedVariant) {
      const vPrice = selectedVariant.salePrice ?? selectedVariant.price;
      if (vPrice != null) return vPrice;
    }
    return hasDiscount ? product.salePrice! : product.basePrice;
  })();

  const originalPrice = (() => {
    if (selectedVariant?.price != null && selectedVariant.salePrice != null) {
      return selectedVariant.price;
    }
    return hasDiscount ? product.basePrice : undefined;
  })();

  const handleAddToCart = async () => {
    setAddToCartError(null);
    setAddToCartLoading(true);
    try {
      await addItem(
        product._id,
        selectedVariant?._id ?? null,
        1
      );
      Alert.alert('Added to cart', 'The item has been added to your cart.', [{ text: 'OK' }]);
      const tabs = navigation.getParent() as { navigate: (name: string) => void } | undefined;
      if (tabs) {
        tabs.navigate('Cart');
      }
    } catch (err) {
      setAddToCartError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setAddToCartLoading(false);
    }
  };

  const isWishlisted = isInWishlist(product._id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <Pressable
          style={styles.wishlistBtn}
          onPress={() => toggleWishlist(product._id)}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={24}
            color={isWishlisted ? '#c00' : '#333'}
          />
        </Pressable>
        {hasDiscount && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              -{Math.round((1 - (product.salePrice ?? 0) / product.basePrice) * 100)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <PriceDisplay
            price={displayPrice}
            originalPrice={originalPrice}
            size="large"
          />
        </View>

        {product.shortDescription ? (
          <Text style={styles.shortDesc}>{product.shortDescription}</Text>
        ) : null}

        {variants.length > 0 && product.options && product.options.length > 0 ? (
          <View style={styles.variants}>
            {product.options.map((opt) => (
              <View key={opt.name} style={styles.optionGroup}>
                <Text style={styles.optionLabel}>{opt.name}</Text>
                <View style={styles.optionValues}>
                  {opt.values.map((val) => {
                    const variant = variants.find(
                      (v) => v.attributes?.[opt.name] === val
                    );
                    const isSelected = selectedVariant?._id === variant?._id;
                    return (
                      <Pressable
                        key={val}
                        style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                        onPress={() => variant && setSelectedVariant(variant)}
                      >
                        <Text
                          style={[
                            styles.optionBtnText,
                            isSelected && styles.optionBtnTextSelected,
                          ]}
                        >
                          {val}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {addToCartError ? (
          <Text style={styles.addToCartError}>{addToCartError}</Text>
        ) : null}
        <Pressable
          style={[styles.addToCart, addToCartLoading && styles.addToCartDisabled]}
          onPress={handleAddToCart}
          disabled={addToCartLoading}
        >
          <Text style={styles.addToCartText}>
            {addToCartLoading ? 'Adding…' : 'Add to Cart'}
          </Text>
        </Pressable>

        {product.description ? (
          <View style={styles.description}>
            <Text style={styles.descTitle}>Description</Text>
            <Text style={styles.descText}>{product.description}</Text>
          </View>
        ) : null}

        <ProductReviews
          productId={product._id}
          initialCount={product.reviewCount ?? 0}
        />
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
    paddingBottom: 32,
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
    fontSize: 14,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#c00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  priceRow: {
    marginBottom: 16,
  },
  shortDesc: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  variants: {
    marginBottom: 24,
  },
  optionGroup: {
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionBtnSelected: {
    borderColor: '#333',
    backgroundColor: '#333',
  },
  optionBtnText: {
    fontSize: 14,
    color: '#333',
  },
  optionBtnTextSelected: {
    color: '#fff',
  },
  addToCart: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  addToCartDisabled: {
    opacity: 0.7,
  },
  addToCartError: {
    fontSize: 14,
    color: '#c00',
    marginBottom: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  descTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
});
