import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getApiBaseUrl } from '../api';
import type { Category } from '../api/catalog';
import { resolveImageUrl } from '../lib/utils';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const imageUrl = resolveImageUrl(category.image, getApiBaseUrl());

  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: 'rgba(255,255,255,0.3)' }}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder} />
      )}
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {category.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#333',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});
