/**
 * quotationService.ts
 * Quotation lifecycle — create, list, get, status update, assign team.
 */
import { apiFetch } from '../api/api';

export interface AdditionalItem {
  item_name: string;
  qty: number;
  unit_price_lkr: number;
}

export interface Quotation {
  _id: string;
  quo_number: string;
  customer_id: string | { _id: string; full_name: string; address: string; contact_number: string };
  package_id: string | { _id: string; name: string };
  chosen_panel_component_id: string;
  additional_items?: AdditionalItem[];
  status:
    | 'draft'
    | 'submitted'
    | 'approved'
    | 'docs_pending'
    | 'active'
    | 'completed'
    | 'overdue'
    | 'cancelled';
  agm_id?: string;
  rm_id?: string;
  bdm_id?: string | { _id: string; full_name: string };
  total_price_lkr: number;
  createdAt: string;
}

export interface CreateQuotationPayload {
  customer_id: string;
  package_id: string;
  chosen_panel_component_id: string;
  additional_items?: AdditionalItem[];
}

export interface ListQuotationParams {
  status?: string;
  bdm_id?: string;
}

// List quotations (BDMs see own only)
export async function listQuotations(params?: ListQuotationParams): Promise<Quotation[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.bdm_id) query.append('bdm_id', params.bdm_id);
  const res = await apiFetch<{ data: Quotation[] }>(`/api/quotations?${query}`, { auth: true });
  return res.data;
}

// Get single quotation
export async function getQuotationById(id: string): Promise<Quotation> {
  const res = await apiFetch<{ data: Quotation }>(`/api/quotations/${id}`, { auth: true });
  return res.data;
}

// Create quotation (BDM only)
export async function createQuotation(payload: CreateQuotationPayload): Promise<Quotation> {
  const res = await apiFetch<{ data: Quotation }>('/api/quotations', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
  return res.data;
}

// Update quotation status
export async function updateQuotationStatus(
  id: string,
  status: Quotation['status']
): Promise<Quotation> {
  const res = await apiFetch<{ data: Quotation }>(`/api/quotations/${id}/status`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ status }),
  });
  return res.data;
}

// Assign AGM + RM to quotation (admin)
export async function assignQuotationTeam(
  id: string,
  agm_id?: string,
  rm_id?: string
): Promise<Quotation> {
  const res = await apiFetch<{ data: Quotation }>(`/api/quotations/${id}/assign-team`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ agm_id, rm_id }),
  });
  return res.data;
}
