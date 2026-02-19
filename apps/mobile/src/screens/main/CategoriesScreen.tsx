import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchCategories } from '../../api/catalog';
import type { Category } from '../../api/catalog';
import type { HomeStackParamList } from '../../navigation/HomeStack';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';

type Props = NativeStackScreenProps<HomeStackParamList, 'Categories'>;

export function CategoriesScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCategoryPress = (category: Category) => {
    (navigation.getParent() as { navigate: (name: string, params?: unknown) => void } | undefined)?.navigate('Shop', {
      screen: 'ShopMain',
      params: { categoryId: category._id, categoryName: category.name },
    });
  };

  if (loading && categories.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && categories.length === 0) {
    return <ErrorView message={error} onRetry={loadCategories} />;
  }

  const renderItem = ({ item }: { item: Category }) => (
    <Pressable
      style={styles.item}
      onPress={() => handleCategoryPress(item)}
      android_ripple={{ color: '#eee' }}
    >
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.chevron}>{'\u203A'}</Text>
    </Pressable>
  );

  return (
    <FlatList
      data={categories}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No categories found</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  chevron: {
    fontSize: 20,
    color: '#999',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
