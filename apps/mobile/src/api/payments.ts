/**
 * Payments API for LogaShop.
 * POST /api/payments/create-intent - Create Stripe PaymentIntent.
 */

import { apiRequest } from './request';

export interface PaymentIntentResponse {
  clientSecret: string;
  id: string;
}

async function parseJsonResponse<T>(res: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const json = await res.json();
  return json as { success: boolean; data?: T; error?: string };
}

/**
 * POST /api/payments/create-intent - Create Stripe PaymentIntent for order.
 * Returns clientSecret and id for PaymentSheet.
 */
export async function createPaymentIntent(
  orderId: string,
  accessToken: string
): Promise<PaymentIntentResponse> {
  const res = await apiRequest({
    path: '/api/payments/create-intent',
    method: 'POST',
    body: { orderId },
    accessToken,
  });

  const parsed = await parseJsonResponse<PaymentIntentResponse>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to create payment intent (${res.status})`);
  }
  return parsed.data;
}
