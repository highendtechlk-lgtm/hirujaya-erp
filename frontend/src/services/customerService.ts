/**
 * customerService.ts
 * Customer CRM — create, list, get, update.
 */
import { apiFetch } from '../api/api';

export interface Customer {
  _id: string;
  full_name: string;
  address: string;
  contact_number: string;
  email?: string;
  createdAt: string;
}

export interface CreateCustomerPayload {
  full_name: string;
  address: string;
  contact_number: string;
  email?: string;
}

export interface ListCustomerParams {
  search?: string;
  page?: number;
  limit?: number;
}

// List / search customers
export async function listCustomers(params?: ListCustomerParams): Promise<{ customers: Customer[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.page)   query.append('page',   String(params.page));
  if (params?.limit)  query.append('limit',  String(params.limit));
  const res = await apiFetch<{ data: { customers: Customer[]; total: number } }>(`/api/customers?${query}`, { auth: true });
  return res.data;
}

// Get single customer
export async function getCustomerById(id: string): Promise<Customer> {
  const res = await apiFetch<{ data: Customer }>(`/api/customers/${id}`, { auth: true });
  return res.data;
}

// Create customer
export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const res = await apiFetch<{ data: Customer }>('/api/customers', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
  return res.data;
}

// Update customer
export async function updateCustomer(id: string, payload: Partial<CreateCustomerPayload>): Promise<Customer> {
  const res = await apiFetch<{ data: Customer }>(`/api/customers/${id}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
  });
  return res.data;
}
