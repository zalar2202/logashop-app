/**
 * Coupon API for LogaShop.
 * POST /api/coupons/validate - Validate coupon for checkout.
 */

import { apiRequest } from './request';

export interface ValidatedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  description?: string;
}

async function parseJsonResponse<T>(res: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const json = await res.json();
  return json as { success: boolean; data?: T; error?: string };
}

/**
 * POST /api/coupons/validate - Validate coupon against cart subtotal.
 * Returns validated coupon data including discountAmount.
 */
export async function validateCoupon(
  code: string,
  subtotal: number,
  accessToken: string
): Promise<ValidatedCoupon> {
  const res = await apiRequest({
    path: '/api/coupons/validate',
    method: 'POST',
    body: { code: code.trim(), subtotal },
    accessToken,
  });

  const parsed = await parseJsonResponse<ValidatedCoupon>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? 'Invalid coupon');
  }
  return parsed.data;
}
