import { post, get } from './client';
import type { ApiResponse, Payment } from '../../types';

// ==========================================
// Payment API Types
// ==========================================

export type PaymentType = 'assessment' | 'quote' | 'tip';

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface SetupCardResponse {
  clientSecret: string;
  setupIntentId: string;
}

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface SavedCardsResponse {
  success: boolean;
  cards: SavedCard[];
}

export interface ChargeCardResponse {
  success: boolean;
  paymentId?: string;
  error?: string;
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
 * Setup a card for future payments
 */
export async function setupCard(
  customerId: string
): Promise<SetupCardResponse> {
  return post<SetupCardResponse>('/api/payments/setup-card', { customerId });
}

/**
 * Get saved cards for a customer
 */
export async function getSavedCards(
  customerId: string
): Promise<SavedCardsResponse> {
  return get<SavedCardsResponse>(
    `/api/payments/saved-cards?customerId=${customerId}`
  );
}

/**
 * Charge a saved card
 * Amount should be in pence
 */
export async function chargeSavedCard(data: {
  customerId: string;
  jobId: string;
  amount: number; // in pence
}): Promise<ChargeCardResponse> {
  return post<ChargeCardResponse>('/api/payments/charge-saved-card', {
    customerId: data.customerId,
    jobId: data.jobId,
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
