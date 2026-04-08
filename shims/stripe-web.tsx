/**
 * Web shim for @stripe/stripe-react-native
 * On web, StripeProvider is a passthrough wrapper since
 * Stripe React Native doesn't support web.
 */
import React from 'react';
import { Platform } from 'react-native';

type StripeProviderProps = {
  publishableKey: string;
  merchantIdentifier?: string;
  children: React.ReactNode;
};

export function StripeProvider({ children }: StripeProviderProps) {
  return <>{children}</>;
}

export function useStripe() {
  return {
    initPaymentSheet: async () => ({ error: { message: 'Stripe not available on web' } }),
    presentPaymentSheet: async () => ({ error: { message: 'Stripe not available on web' } }),
    confirmPayment: async () => ({ error: { message: 'Stripe not available on web' } }),
  };
}

export function usePaymentSheet() {
  return {
    initPaymentSheet: async () => ({ error: { message: 'Stripe not available on web' } }),
    presentPaymentSheet: async () => ({ error: { message: 'Stripe not available on web' } }),
    loading: false,
  };
}
