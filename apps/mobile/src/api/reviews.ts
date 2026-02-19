/**
 * Reviews API for LogaShop.
 * GET /api/products/[id]/reviews — List approved reviews
 * POST /api/products/[id]/reviews — Create a review (auth required)
 */

import { getApiBaseUrl, getApiHeaders } from '../api';
import { apiRequest } from './request';

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface FetchReviewsResponse {
  success: boolean;
  data?: Review[];
  pagination?: { total: number; page: number; limit: number; pages: number };
  error?: string;
}

async function parseJsonResponse<T>(res: Response): Promise<{ success: boolean; data?: T; pagination?: unknown; error?: string }> {
  const json = await res.json();
  return json as { success: boolean; data?: T; pagination?: unknown; error?: string };
}

/**
 * GET /api/products/[id]/reviews - Fetch approved reviews for a product.
 * No auth required.
 */
export async function fetchReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<{ reviews: Review[]; pagination: { total: number; page: number; limit: number; pages: number } }> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL not configured');

  const url = `${base}/api/products/${productId}/reviews?page=${page}&limit=${limit}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(),
  });

  const parsed = await parseJsonResponse<Review[]>(res);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.error ?? 'Failed to fetch reviews');
  }
  const reviews = Array.isArray(parsed.data) ? parsed.data : [];
  const pagination = parsed.pagination as { total: number; page: number; limit: number; pages: number } | undefined;
  return {
    reviews,
    pagination: pagination ?? { total: reviews.length, page: 1, limit, pages: 1 },
  };
}

/**
 * POST /api/products/[id]/reviews - Create a review.
 * Requires auth (Bearer).
 */
export async function submitReview(
  productId: string,
  rating: number,
  comment: string,
  accessToken: string
): Promise<Review> {
  const res = await apiRequest({
    path: `/api/products/${productId}/reviews`,
    method: 'POST',
    body: { rating, comment: comment.trim() },
    accessToken,
  });

  const parsed = await parseJsonResponse<Review>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? 'Failed to submit review');
  }
  return parsed.data;
}
