/**
 * Shipping zones API for LogaShop.
 * GET /api/shipping-zones?country=&state= - Public lookup for shipping methods.
 */

import { getApiBaseUrl, getApiHeaders } from '../api';

export interface ShippingMethod {
  methodId: 'standard' | 'express' | 'overnight' | 'pickup' | 'digital';
  label: string;
  description?: string;
  price: number;
  freeThreshold: number | null;
  estimatedDays?: string;
}

export interface ShippingZoneResponse {
  zoneId: string;
  zoneName: string;
  methods: ShippingMethod[];
}

async function parseJsonResponse<T>(res: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const json = await res.json();
  return json as { success: boolean; data?: T; error?: string };
}

/**
 * GET /api/shipping-zones?country=&state= - Fetch shipping methods for address.
 * Public endpoint, no auth required.
 */
export async function fetchShippingMethods(
  country: string,
  state?: string
): Promise<ShippingZoneResponse | null> {
  const base = getApiBaseUrl();
  if (!base) throw new Error('API base URL not configured');

  const params = new URLSearchParams({ country: country.toUpperCase() });
  if (state?.trim()) {
    params.set('state', state.toUpperCase());
  }

  const res = await fetch(`${base}/api/shipping-zones?${params}`, {
    method: 'GET',
    headers: getApiHeaders(),
  });

  const parsed = await parseJsonResponse<ShippingZoneResponse>(res);
  if (!res.ok) {
    throw new Error(parsed.error ?? `Failed to fetch shipping methods (${res.status})`);
  }
  return parsed.data ?? null;
}
