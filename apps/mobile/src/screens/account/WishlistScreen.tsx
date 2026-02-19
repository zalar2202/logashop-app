import React from 'react';
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
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { ProductCard } from '../../components/ProductCard';
import type { Product } from '../../api/catalog';
import type { AccountStackParamList } from '../../navigation/AccountStack';

type NavProp = NativeStackNavigationProp<AccountStackParamList, 'Wishlist'>;

const COLUMNS = 2;

export function WishlistScreen() {
  const navigation = useNavigation<NavProp>();
  const { products, loading, refreshWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleProductPress = (productId: string) => {
    navigation.navigate('Main', {
      screen: 'Home',
      params: { screen: 'ProductDetail', params: { productId } },
    });
  };

  const handleShopPress = () => {
    navigation.navigate('Main', { screen: 'Shop' });
  };

  const handleAddToCart = async (productId: string, e: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.();
    try {
      await addItem(productId, null, 1);
      navigation.navigate('Main', { screen: 'Cart' });
    } catch {
      // Error handled by CartContext
    }
  };

  if (loading && products.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>
          Save products you love to your wishlist and add them to cart when you're ready.
        </Text>
        <Pressable style={styles.browseBtn} onPress={handleShopPress}>
          <Text style={styles.browseBtnText}>Browse Shop</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      numColumns={COLUMNS}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      columnWrapperStyle={styles.row}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshWishlist} />
      }
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <ProductCard
            product={item as Product}
            onPress={() => handleProductPress(item._id)}
            isInWishlist={true}
            onWishlistPress={() => toggleWishlist(item._id)}
            showAddToCart={true}
            onAddToCart={(e) => handleAddToCart(item._id, e)}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 8,
    paddingBottom: 48,
  },
  row: {
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
});
