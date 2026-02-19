import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchProducts, fetchCategories } from '../../api/catalog';
import type { Product, Category } from '../../api/catalog';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { ProductCard } from '../../components/ProductCard';
import { CategoryCard } from '../../components/CategoryCard';
import { useWishlist } from '../../contexts/WishlistContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export function HomeScreen({ navigation }: Props) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, featRes] = await Promise.all([
        fetchCategories(null), // root categories only for hero
        fetchProducts({
          status: 'active',
          featured: true,
          limit: 8,
        }),
      ]);
      setCategories(catsRes);
      setFeaturedProducts(featRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShopNow = () => {
    (navigation.getParent() as { navigate: (name: string) => void } | undefined)?.navigate('Shop');
  };

  const handleCategoryPress = (category: Category) => {
    (navigation.getParent() as { navigate: (name: string, params?: unknown) => void } | undefined)?.navigate('Shop', {
      screen: 'ShopMain',
      params: { categoryId: category._id, categoryName: category.name },
    });
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Discover Quality Products</Text>
        <Text style={styles.heroSubtitle}>
          Shop the latest trends with free shipping on orders over $50.
        </Text>
        <Pressable style={styles.heroButton} onPress={handleShopNow}>
          <Text style={styles.heroButtonText}>Shop Now</Text>
        </Pressable>
      </View>

      {/* Categories */}
      {categories.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Pressable onPress={() => navigation.navigate('Categories')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => (
              <CategoryCard
                key={cat._id}
                category={cat}
                onPress={() => handleCategoryPress(cat)}
              />
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.section}>
          <Pressable onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.seeAll}>Browse All Categories</Text>
          </Pressable>
        </View>
      )}

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <Pressable onPress={handleShopNow}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>
        {featuredProducts.length > 0 ? (
          <View style={styles.productGrid}>
            {featuredProducts.map((product) => (
              <View key={product._id} style={styles.productCardWrapper}>
                <ProductCard
                  product={product}
                  onPress={() => handleProductPress(product._id)}
                  isInWishlist={isInWishlist(product._id)}
                  onWishlistPress={() => toggleWishlist(product._id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No featured products yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: '#333',
    padding: 24,
    paddingVertical: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  categoriesScroll: {
    paddingRight: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  productCardWrapper: {
    width: '50%',
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
});
