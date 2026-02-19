import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

export interface FilterValues {
  categoryId: string | null;
  categoryName: string | null;
  minPrice: string;
  maxPrice: string;
  saleOnly: boolean;
  sort: string;
}

export interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onApply: (values: FilterValues) => void;
  categories: { _id: string; name: string }[];
  sortOptions: { value: string; label: string }[];
}

const initialState: FilterValues = {
  categoryId: null,
  categoryName: null,
  minPrice: '',
  maxPrice: '',
  saleOnly: false,
  sort: 'newest',
};

export function FilterSheet({
  visible,
  onClose,
  values,
  onChange,
  onApply,
  categories,
  sortOptions,
}: FilterSheetProps) {
  const handleReset = () => {
    onChange(initialState);
  };

  const handleApply = () => {
    onApply(values);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                <Pressable
                  style={[styles.chip, !values.categoryId && styles.chipSelected]}
                  onPress={() => onChange({ ...values, categoryId: null, categoryName: null })}
                >
                  <Text style={[styles.chipText, !values.categoryId && styles.chipTextSelected]}>
                    All
                  </Text>
                </Pressable>
                {categories.map((cat) => {
                  const isSelected = values.categoryId === cat._id;
                  return (
                    <Pressable
                      key={cat._id}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() =>
                        onChange({ ...values, categoryId: cat._id, categoryName: cat.name })
                      }
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Price range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price range (USD)</Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  value={values.minPrice}
                  onChangeText={(v) => onChange({ ...values, minPrice: v })}
                />
                <Text style={styles.priceSeparator}>–</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  value={values.maxPrice}
                  onChangeText={(v) => onChange({ ...values, maxPrice: v })}
                />
              </View>
            </View>

            {/* Sale only */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>On sale only</Text>
                <Switch
                  value={values.saleOnly}
                  onValueChange={(v) => onChange({ ...values, saleOnly: v })}
                  trackColor={{ false: '#ddd', true: '#333' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Sort */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort by</Text>
              {sortOptions.map((opt) => {
                const isSelected = values.sort === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.sortOption, isSelected && styles.sortOptionSelected]}
                    onPress={() => onChange({ ...values, sort: opt.value })}
                  >
                    <Text style={[styles.sortOptionText, isSelected && styles.sortOptionTextSelected]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  close: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipRow: {
    marginHorizontal: -4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#333',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#666',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionSelected: {
    backgroundColor: '#e8e8e8',
    borderWidth: 1,
    borderColor: '#333',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  sortOptionTextSelected: {
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
