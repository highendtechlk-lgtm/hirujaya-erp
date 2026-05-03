/**
 * paymentService.ts
 * Payment recording and summary.
 */
import { apiFetch } from '../api/api';

export interface Payment {
  _id: string;
  quotation_id: string;
  amount_lkr: number;
  payment_method: 'cash' | 'cheque' | 'bank_transfer';
  payment_date: string;
  reference_number?: string;
  notes?: string;
  createdAt: string;
}

export interface PaymentSummary {
  total_paid: number;
  total_due: number;
  payments: Payment[];
}

export interface CreatePaymentPayload {
  quotation_id: string;
  amount_lkr: number;
  payment_method: 'cash' | 'cheque' | 'bank_transfer';
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

// Record a new payment (admin / agm)
export async function recordPayment(payload: CreatePaymentPayload): Promise<Payment> {
  const res = await apiFetch<{ data: Payment }>('/api/payments', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
  return res.data;
}

// Get payment summary for a quotation
export async function getPaymentSummary(quotationId: string): Promise<PaymentSummary> {
  const res = await apiFetch<{ data: PaymentSummary }>(`/api/payments/quotation/${quotationId}`, { auth: true });
  return res.data;
}
