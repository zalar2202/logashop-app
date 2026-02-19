/**
 * Catalog API: products, categories, variants.
 * Aligned with apps/web/docs/DATA_MODELS.md (prices in cents).
 */

import { getApiBaseUrl, getApiHeaders } from '../api';

// --- Types (aligned with DATA_MODELS.md) ---

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CategoryRef {
  _id: string;
  name: string;
  slug: string;
  ancestors?: { _id: string; name: string; slug: string }[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  shortDescription?: string;
  productType?: 'physical' | 'digital' | 'bundle';
  categoryId: CategoryRef | string;
  tags?: string[];
  brand?: string;
  basePrice: number;
  salePrice?: number;
  salePriceStart?: string;
  salePriceEnd?: string;
  status?: string;
  isFeatured?: boolean;
  trackInventory?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  allowBackorder?: boolean;
  options?: { name: string; values: string[] }[];
  images?: ProductImage[];
  metaTitle?: string;
  metaDescription?: string;
  totalSold?: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  _id: string;
  productId: string;
  sku?: string;
  attributes?: Record<string, string>;
  price?: number | null;
  salePrice?: number;
  stockQuantity?: number;
  weight?: number;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  ancestors?: { _id: string; name: string; slug: string }[];
  level?: number;
  isActive?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

export interface ProductDetailResponse {
  success: boolean;
  data: Product;
}

export interface VariantsResponse {
  success: boolean;
  data: ProductVariant[];
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'popular';
  featured?: boolean;
  sale?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? `Request failed: ${res.status}`);
  }
  if (json.success === false) {
    throw new Error(json.error ?? 'Request failed');
  }
  return json as T;
}

/**
 * Fetch products with optional filters.
 */
export async function fetchProducts(
  params: FetchProductsParams = {},
  accessToken?: string | null
): Promise<ProductsResponse> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL not configured');

  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.featured) searchParams.set('featured', 'true');
  if (params.sale) searchParams.set('sale', 'true');
  if (params.minPrice != null) searchParams.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) searchParams.set('maxPrice', String(params.maxPrice));

  const url = `${base}/api/products?${searchParams.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(accessToken),
  });

  return parseJsonResponse<ProductsResponse>(res);
}

/**
 * Fetch single product by ID.
 */
export async function fetchProduct(
  productId: string,
  accessToken?: string | null
): Promise<Product> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL not configured');

  const url = `${base}/api/products/${productId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(accessToken),
  });

  const json = await parseJsonResponse<ProductDetailResponse>(res);
  return json.data;
}

/**
 * Fetch variants for a product.
 */
export async function fetchProductVariants(
  productId: string,
  accessToken?: string | null
): Promise<ProductVariant[]> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL not configured');

  const url = `${base}/api/products/${productId}/variants`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(accessToken),
  });

  const json = await parseJsonResponse<VariantsResponse>(res);
  return json.data;
}

/**
 * Fetch categories. Pass parentId=null for root categories.
 */
export async function fetchCategories(
  parentId?: string | null,
  accessToken?: string | null
): Promise<Category[]> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL not configured');

  const searchParams = new URLSearchParams();
  if (parentId === null || parentId === 'null') {
    searchParams.set('parentId', 'null');
  } else if (parentId) {
    searchParams.set('parentId', parentId);
  }

  const url = `${base}/api/categories?${searchParams.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getApiHeaders(accessToken),
  });

  const json = await parseJsonResponse<CategoriesResponse>(res);
  return json.data;
}
