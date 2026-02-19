/**
 * Downloads API for LogaShop.
 * GET /api/account/downloads — Fetch user's digital deliveries
 */

import { apiRequest } from './request';

export interface DownloadItem {
  _id: string;
  downloadToken: string;
  fileName: string;
  fileUrl?: string;
  downloadCount: number;
  maxDownloads: number | null;
  expiresAt: string | null;
  status: 'active' | 'revoked' | 'expired';
  isValid: boolean;
  productId?: { name: string; images?: { url: string }[] };
  orderId?: { orderNumber: string };
}

interface FetchDownloadsResponse {
  success: boolean;
  downloads?: DownloadItem[];
  error?: string;
}

async function parseJsonResponse(res: Response): Promise<FetchDownloadsResponse> {
  const json = await res.json();
  return json as FetchDownloadsResponse;
}

/**
 * GET /api/account/downloads - Fetch user's digital deliveries.
 * Requires auth (Bearer).
 */
export async function fetchDownloads(accessToken: string): Promise<DownloadItem[]> {
  const res = await apiRequest({
    path: '/api/account/downloads',
    method: 'GET',
    accessToken,
  });

  const parsed = await parseJsonResponse(res);
  if (!res.ok || !parsed.success) {
    throw new Error(parsed.error ?? 'Failed to fetch downloads');
  }
  return parsed.downloads ?? [];
}
