import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as authStorage from '../../lib/authStorage';
import * as reviewsApi from '../../api/reviews';
import type { Review } from '../../api/reviews';

interface ProductReviewsProps {
  productId: string;
  initialCount?: number;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProductReviews({ productId, initialCount = 0 }: ProductReviewsProps) {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { reviews: list } = await reviewsApi.fetchReviews(productId);
      setReviews(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const hasReviewed = user ? reviews.some((r) => r.userId === user.id) : false;
  const canWriteReview = isAuthenticated && !hasReviewed && !showForm;

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) {
      Alert.alert('Missing fields', 'Please provide both a rating and a comment.');
      return;
    }
    const token = (await authStorage.getTokens())?.accessToken;
    if (!token) {
      Alert.alert('Session expired', 'Please log in again.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.submitReview(productId, rating, comment, token);
      Alert.alert('Thank you!', 'Your review has been submitted.');
      setComment('');
      setRating(5);
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    const root = navigation.getParent?.();
    const rootNav = root && typeof root === 'object' && 'getParent' in root
      ? (root as { getParent: () => unknown }).getParent()
      : root;
    const target = rootNav ?? navigation;
    if (target && typeof target === 'object' && 'navigate' in target) {
      (target as { navigate: (name: string, params?: { screen: string }) => void }).navigate('Auth', { screen: 'Login' });
    }
  };

  const starBtn = (value: number) => (
    <Pressable
      key={value}
      onPress={() => setRating(value)}
      hitSlop={8}
      style={styles.starBtn}
    >
      <Ionicons
        name={rating >= value ? 'star' : 'star-outline'}
        size={28}
        color={rating >= value ? '#f59e0b' : '#ccc'}
      />
    </Pressable>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewHeaderLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.userName || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.reviewMeta}>
            <View style={styles.reviewNameRow}>
              <Text style={styles.userName}>{item.userName}</Text>
              {item.isVerifiedPurchase && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#059669" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name={item.rating >= s ? 'star' : 'star-outline'}
                  size={14}
                  color={item.rating >= s ? '#f59e0b' : '#ddd'}
                />
              ))}
            </View>
          </View>
        </View>
        <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Customer Reviews</Text>
          <Text style={styles.count}>
            {loading ? '...' : reviews.length} reviews for this product
          </Text>
        </View>
        {canWriteReview && (
          <Pressable style={styles.writeBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.writeBtnText}>Write a Review</Text>
          </Pressable>
        )}
      </View>

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Share your thoughts</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(starBtn)}
          </View>
          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            placeholder="What did you like or dislike?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            editable={!submitting}
          />
          <View style={styles.formActions}>
            <Pressable
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Review</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => setShowForm(false)}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!isAuthenticated && !showForm && (
        <View style={styles.guestPrompt}>
          <Ionicons name="alert-circle-outline" size={20} color="#92400e" />
          <Text style={styles.guestText}>Log in to share your review with other customers.</Text>
          <Pressable style={styles.loginBtn} onPress={navigateToLogin}>
            <Text style={styles.loginBtnText}>Log in</Text>
          </Pressable>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#333" />
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="chatbubble-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>
            No reviews yet. Be the first to review this product!
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={renderReview}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  count: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  writeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  writeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  form: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  starBtn: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  submitBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    color: '#666',
  },
  guestPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 10,
    flexWrap: 'wrap',
  },
  guestText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  loginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d97706',
    backgroundColor: '#fff',
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#c00',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  reviewItem: {
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(51,51,51,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  reviewMeta: {
    flex: 1,
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginLeft: 52,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
});
