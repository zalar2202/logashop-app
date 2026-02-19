/**
 * Orders API for LogaShop.
 * GET /api/orders - List, or fetch by id/orderNumber/trackingCode.
 */

import { getApiBaseUrl, getApiHeaders } from '../api';
import { apiRequest } from './request';

export interface OrderItem {
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  sku: string;
  image: string | null;
  price: number;
  quantity: number;
  variantInfo: Record<string, string> | null;
  lineTotal: number;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  trackingCode?: string;
  userId?: string;
  guestEmail?: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  subtotal: number;
  shippingCost: number;
  taxAmount?: number;
  discount?: number;
  total: number;
  shippingMethod: string;
  shippingMethodLabel?: string;
  status: string;
  paymentStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

async function parseJsonResponse<T>(res: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const json = await res.json();
  return json as { success: boolean; data?: T; error?: string };
}

/**
 * GET /api/orders?id= - Fetch order by ID.
 */
export async function fetchOrderById(orderId: string, accessToken: string): Promise<Order> {
  const res = await apiRequest({
    path: `/api/orders?id=${encodeURIComponent(orderId)}`,
    method: 'GET',
    accessToken,
  });

  const parsed = await parseJsonResponse<Order>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to fetch order (${res.status})`);
  }
  return parsed.data;
}

/**
 * GET /api/orders?orderNumber= - Fetch order by order number.
 */
export async function fetchOrderByNumber(
  orderNumber: string,
  accessToken: string
): Promise<Order> {
  const res = await apiRequest({
    path: `/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`,
    method: 'GET',
    accessToken,
  });

  const parsed = await parseJsonResponse<Order>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to fetch order (${res.status})`);
  }
  return parsed.data;
}

export interface OrdersListResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * GET /api/orders - List orders for logged-in user (paginated).
 */
export async function fetchOrders(
  accessToken: string,
  opts?: { page?: number; limit?: number; status?: string }
): Promise<OrdersListResponse> {
  const params = new URLSearchParams();
  if (opts?.page != null) params.set('page', String(opts.page));
  if (opts?.limit != null) params.set('limit', String(opts.limit));
  if (opts?.status) params.set('status', opts.status);
  const query = params.toString();

  const res = await apiRequest({
    path: `/api/orders${query ? `?${query}` : ''}`,
    method: 'GET',
    accessToken,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? `Failed to fetch orders (${res.status})`);
  }
  const data = json as { success: boolean; data?: Order[]; pagination?: OrdersListResponse['pagination'] };
  return {
    data: data.data ?? [],
    pagination: data.pagination ?? { page: 1, limit: 10, total: 0, pages: 0 },
  };
}

/**
 * GET /api/orders?trackingCode= - Fetch order by tracking code (guest, no auth).
 */
export async function fetchOrderByTrackingCode(trackingCode: string): Promise<Order> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL not configured');

  const res = await fetch(`${base}/api/orders?trackingCode=${encodeURIComponent(trackingCode)}`, {
    method: 'GET',
    headers: getApiHeaders(),
  });

  const parsed = await (res.json().catch(() => ({}))) as { success: boolean; data?: Order; error?: string };
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? 'Order not found');
  }
  return parsed.data;
}
