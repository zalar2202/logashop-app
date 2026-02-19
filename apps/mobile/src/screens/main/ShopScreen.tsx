import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchProducts, fetchCategories } from '../../api/catalog';
import type { Category, FetchProductsParams, Product } from '../../api/catalog';
import type { ShopStackParamList } from '../../navigation/ShopStack';
import { ProductCard } from '../../components/ProductCard';
import { useWishlist } from '../../contexts/WishlistContext';
import { FilterSheet, type FilterValues } from '../../components/FilterSheet';
import { useDebounce } from '../../hooks/useDebounce';

type Props = NativeStackScreenProps<ShopStackParamList, 'ShopMain'>;

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
];

const emptyFilters: FilterValues = {
  categoryId: null,
  categoryName: null,
  minPrice: '',
  maxPrice: '',
  saleOnly: false,
  sort: 'newest',
};

function getInitialFilters(categoryId?: string, categoryName?: string): FilterValues {
  if (categoryId && categoryName) {
    return { ...emptyFilters, categoryId, categoryName };
  }
  return emptyFilters;
}

export function ShopScreen({ navigation, route }: Props) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { categoryId: initialCategoryId, categoryName: initialCategoryName } = route.params ?? {};
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 300);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searched, setSearched] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(() =>
    getInitialFilters(initialCategoryId, initialCategoryName)
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const limit = 12;

  const loadResults = useCallback(
    async (
      pageNum: number,
      append: boolean,
      overrides?: { search?: string; filters?: FilterValues }
    ) => {
      const searchTerm =
        (overrides?.search !== undefined ? overrides.search : query.trim()) || undefined;
      const effectiveFilters = overrides?.filters ?? filters;

      if (pageNum === 1) {
        setResultsLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params: FetchProductsParams = {
          page: pageNum,
          limit,
          status: 'active',
          search: searchTerm,
          category: effectiveFilters.categoryId ?? undefined,
          sort: (effectiveFilters.sort as FetchProductsParams['sort']) ?? 'newest',
        };
        if (effectiveFilters.minPrice) params.minPrice = parseFloat(effectiveFilters.minPrice);
        if (effectiveFilters.maxPrice) params.maxPrice = parseFloat(effectiveFilters.maxPrice);
        if (effectiveFilters.saleOnly) params.sale = true;

        const res = await fetchProducts(params);

        if (append) {
          setResults((prev) => [...prev, ...res.data]);
        } else {
          setResults(res.data);
        }
        setHasMore(res.pagination.page < res.pagination.pages);
      } catch {
        if (!append) setResults([]);
        setHasMore(false);
      } finally {
        setResultsLoading(false);
        setLoadingMore(false);
      }
    },
    [query, filters]
  );

  useEffect(() => {
    const initialFilters = getInitialFilters(initialCategoryId, initialCategoryName);
    setFilters(initialFilters);
    setSearched(true);
    setPage(1);
    loadResults(1, false, {
      search: '',
      filters: initialFilters,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only when route params change
  }, [initialCategoryId, initialCategoryName]);


  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setSuggestionsLoading(true);
    fetchProducts({
      search: debouncedQuery,
      limit: 6,
      status: 'active',
    })
      .then((res) => {
        if (!cancelled) setSuggestions(res.data);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setSuggestionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const applyFiltersAndSearch = useCallback(
    (appliedFilters?: FilterValues) => {
      if (appliedFilters) setFilters(appliedFilters);
      setSearched(true);
      setPage(1);
      Keyboard.dismiss();
      loadResults(1, false, appliedFilters ? { filters: appliedFilters } : undefined);
    },
    [loadResults]
  );

  const handleSubmitSearch = useCallback(() => {
    setSearched(true);
    setPage(1);
    loadResults(1, false);
  }, [loadResults]);

  useEffect(() => {
    if (searched && page > 1) {
      loadResults(page, true);
    }
  }, [page, searched, loadResults]);

  const handleSuggestionPress = useCallback(
    (product: Product) => {
      setQuery(product.name);
      setSuggestions([]);
      Keyboard.dismiss();
      navigation.navigate('ProductDetail', { productId: product._id });
    },
    [navigation]
  );

  const handleSearchSuggestion = useCallback(() => {
    setSearched(true);
    setPage(1);
    loadResults(1, false);
    setSuggestions([]);
    Keyboard.dismiss();
  }, [loadResults]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories(null);
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    if (filtersVisible) loadCategories();
  }, [filtersVisible, loadCategories]);

  const handleProductPress = useCallback(
    (productId: string) => {
      navigation.navigate('ProductDetail', { productId });
    },
    [navigation]
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) setPage((p) => p + 1);
  }, [loadingMore, hasMore]);

  const filterCount =
    (filters.categoryId ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.saleOnly ? 1 : 0);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.cardWrapper}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item._id)}
        isInWishlist={isInWishlist(item._id)}
        onWishlistPress={() => toggleWishlist(item._id)}
      />
    </View>
  );

  const showSuggestions =
    !searched &&
    debouncedQuery.length >= 2 &&
    (suggestions.length > 0 || suggestionsLoading);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search products..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmitSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          style={[styles.filterBtn, filterCount > 0 && styles.filterBtnActive]}
          onPress={() => setFiltersVisible(true)}
        >
          <Text style={[styles.filterIcon, filterCount > 0 && styles.filterIconActive]}>☰</Text>
          {filterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsPanel}>
          {suggestionsLoading ? (
            <ActivityIndicator size="small" color="#333" style={styles.suggestionsLoader} />
          ) : (
            <>
              {suggestions.map((p) => (
                <Pressable
                  key={p._id}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(p)}
                  android_ripple={{ color: '#eee' }}
                >
                  <Text style={styles.suggestionText} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={styles.suggestionChevron}>{'\u203A'}</Text>
                </Pressable>
              ))}
              <Pressable
                style={styles.suggestionItem}
                onPress={handleSearchSuggestion}
                android_ripple={{ color: '#eee' }}
              >
                <Text style={styles.suggestionSearch}>Search "{debouncedQuery}"</Text>
                <Text style={styles.suggestionChevron}>{'\u203A'}</Text>
              </Pressable>
            </>
          )}
        </View>
      )}

      {searched && (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {resultsLoading && results.length === 0
                ? 'Loading...'
                : `${results.length}${hasMore ? '+' : ''} results`}
            </Text>
          </View>
          {resultsLoading && results.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#333" />
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              key="grid"
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.list}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={async () => {
                    setRefreshing(true);
                    await loadResults(1, false);
                    setPage(1);
                    setRefreshing(false);
                  }}
                />
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>
                    No products found. Try different search or filters.
                  </Text>
                </View>
              }
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.footer}>
                    <ActivityIndicator size="small" color="#333" />
                  </View>
                ) : null
              }
            />
          )}
        </>
      )}

      <FilterSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        values={filters}
        onChange={setFilters}
        onApply={(vals) => applyFiltersAndSearch(vals)}
        categories={categories}
        sortOptions={SORT_OPTIONS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  filterBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  filterBtnActive: {
    backgroundColor: '#333',
  },
  filterIcon: {
    fontSize: 20,
    color: '#333',
  },
  filterIconActive: {
    color: '#fff',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#c00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  suggestionsPanel: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  suggestionsLoader: {
    padding: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  suggestionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  suggestionSearch: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  suggestionChevron: {
    fontSize: 18,
    color: '#999',
    marginLeft: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    padding: 8,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
