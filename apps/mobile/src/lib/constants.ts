/**
 * Shared constants for the mobile app.
 */

/** US state codes for address forms */
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
  'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
  'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV',
  'WI', 'WY',
];

/** Default shipping methods when API returns null (fallback) */
export const FALLBACK_SHIPPING_METHODS = [
  {
    methodId: 'standard' as const,
    label: 'Standard Shipping',
    description: '5-7 business days',
    price: 499,
    freeThreshold: 5000,
    estimatedDays: '5-7 business days',
  },
  {
    methodId: 'express' as const,
    label: 'Express Shipping',
    description: '2-3 business days',
    price: 999,
    freeThreshold: null,
    estimatedDays: '2-3 business days',
  },
  {
    methodId: 'overnight' as const,
    label: 'Overnight Shipping',
    description: 'Next business day',
    price: 1999,
    freeThreshold: null,
    estimatedDays: 'Next business day',
  },
];
