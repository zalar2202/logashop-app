/**
 * Addresses API for LogaShop.
 * GET /api/addresses, POST /api/addresses, PUT /api/addresses, DELETE /api/addresses.
 */

import { apiRequest } from './request';

export interface Address {
  _id: string;
  userId: string;
  label?: string;
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
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressInput {
  label?: string;
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
  isDefault?: boolean;
}

async function parseJsonResponse<T>(res: Response): Promise<{ success: boolean; data?: T; error?: string }> {
  const json = await res.json();
  return json as { success: boolean; data?: T; error?: string };
}

/**
 * GET /api/addresses - Fetch saved addresses for logged-in user.
 */
export async function fetchAddresses(accessToken: string): Promise<Address[]> {
  const res = await apiRequest({
    path: '/api/addresses',
    method: 'GET',
    accessToken,
  });

  const parsed = await parseJsonResponse<Address[]>(res);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.error ?? `Failed to fetch addresses (${res.status})`);
  }
  return parsed.data ?? [];
}

/**
 * POST /api/addresses - Create a new address.
 */
export async function createAddress(
  body: AddressInput,
  accessToken: string
): Promise<Address> {
  const res = await apiRequest({
    path: '/api/addresses',
    method: 'POST',
    body,
    accessToken,
  });

  const parsed = await parseJsonResponse<Address>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to create address (${res.status})`);
  }
  return parsed.data;
}

/**
 * PUT /api/addresses - Update an address.
 */
export async function updateAddress(
  id: string,
  body: Partial<AddressInput>,
  accessToken: string
): Promise<Address> {
  const res = await apiRequest({
    path: '/api/addresses',
    method: 'PUT',
    body: { addressId: id, ...body },
    accessToken,
  });

  const parsed = await parseJsonResponse<Address>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to update address (${res.status})`);
  }
  return parsed.data;
}

/**
 * DELETE /api/addresses - Delete an address.
 */
export async function deleteAddress(id: string, accessToken: string): Promise<void> {
  const res = await apiRequest({
    path: `/api/addresses?id=${encodeURIComponent(id)}`,
    method: 'DELETE',
    accessToken,
  });

  const parsed = await parseJsonResponse<unknown>(res);
  if (!res.ok || parsed.success === false) {
    throw new Error(parsed.error ?? `Failed to delete address (${res.status})`);
  }
}

/**
 * PUT /api/addresses - Set an address as default.
 */
export async function setDefaultAddress(id: string, accessToken: string): Promise<Address> {
  const res = await apiRequest({
    path: '/api/addresses',
    method: 'PUT',
    body: { addressId: id, isDefault: true },
    accessToken,
  });

  const parsed = await parseJsonResponse<Address>(res);
  if (!res.ok || !parsed.success || !parsed.data) {
    throw new Error(parsed.error ?? `Failed to set default address (${res.status})`);
  }
  return parsed.data;
}
