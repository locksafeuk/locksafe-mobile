import { post } from './client';

// ==========================================
// Payment API Types
// ==========================================

export type PaymentType = 'assessment' | 'quote' | 'tip';

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// ==========================================
// Payment API Functions
// ==========================================

/**
 * Create a payment intent for a job payment
 * Amount should be in pence (e.g., 2900 for £29.00)
 */
export async function createPaymentIntent(data: {
  jobId: string;
  type: PaymentType;
  amount: number; // in pence
}): Promise<CreatePaymentIntentResponse> {
  return post<CreatePaymentIntentResponse>('/api/payments/create-intent', {
    jobId: data.jobId,
    type: data.type,
    amount: data.amount,
  });
}

/**
 * Convert pounds to pence
 */
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}

/**
 * Convert pence to pounds
 */
export function penceToPounds(pence: number): number {
  return pence / 100;
}

/**
 * Format amount in pounds with currency symbol
 */
export function formatCurrency(pence: number): string {
  return `£${penceToPounds(pence).toFixed(2)}`;
}

/**
 * Format amount from pounds value
 */
export function formatPounds(pounds: number): string {
  return `£${pounds.toFixed(2)}`;
}
