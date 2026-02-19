/**
 * Format price from cents to USD string.
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Resolve image URL to absolute. If url starts with http/https, return as-is.
 * Otherwise prepend baseUrl (e.g. API base).
 */
export function resolveImageUrl(url: string | undefined, baseUrl: string): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = baseUrl.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}
