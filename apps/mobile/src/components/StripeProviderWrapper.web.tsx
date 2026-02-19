import React from 'react';

interface Props {
  publishableKey: string;
  children: React.ReactNode;
}

/**
 * Web placeholder - Stripe React Native uses native modules and is not supported on web.
 * Payments on web would require @stripe/stripe-js; for mobile-first app we just pass through.
 */
export function StripeProviderWrapper({ children }: Props) {
  return <>{children}</>;
}
