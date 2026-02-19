/**
 * Checkout API for LogaShop.
 * POST /api/checkout - Create order from cart.
 */

import { apiRequest } from './request';

export interface ShippingAddressInput {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  phone?: string;
}

export interface CheckoutBody {
  shippingAddress: ShippingAddressInput;
  billingAddress?: ShippingAddressInput;
  billingSameAsShipping: boolean;
  shippingMethod: string;
  customerNote?: string;
  sessionId?: string;
  couponCode?: string;
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  trackingCode?: string;
  total: number;
  status: string;
}

async function parseJsonResponse<T>(res: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const json = await res.json();
  return json as { success: boolean; data?: T; error?: string };
}

/**
 * POST /api/checkout - Create order from current cart.
 * Requires auth on mobile. Pass cartSessionId for cart resolution (guest merge case).
 */
export async function createOrder(
  body: CheckoutBody,
  accessToken: string,
  cartSessionId?: string | null
): Promise<CheckoutResponse> {
  const payload: Record<string, unknown> = {
    shippingAddress: body.shippingAddress,
    billingSameAsShipping: body.billingSameAsShipping,
    shippingMethod: body.shippingMethod,
    customerNote: body.customerNote ?? '',
  };

  if (!body.billingSameAsShipping && body.billingAddress) {
    payload.billingAddress = body.billingAddress;
  }

  if (cartSessionId) {
    payload.sessionId = cartSessionId;
  }

  if (body.couponCode?.trim()) {
    payload.couponCode = body.couponCode.trim();
  }

  const res = await apiRequest({
    path: '/api/checkout',
    method: 'POST',
    body: payload,
    accessToken,
    cartSessionId: cartSessionId ?? undefined,
  });

  const parsed = await parseJsonResponse<CheckoutResponse>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Checkout failed (${res.status})`);
  }
  return parsed.data;
}
