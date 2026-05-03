/**
 * componentService.ts
 * Component catalog — create, list, get, update.
 */
import { apiFetch } from '../api/api';

export interface Component {
  _id: string;
  type: string;
  brand: string;
  model: string;
  capacity: number;
  capacity_unit: 'W' | 'kW' | 'kWh';
  warranty_years?: number;
  data_sheet_url?: string;
  is_active: boolean;
}

export interface CreateComponentPayload {
  type: string;
  brand: string;
  model: string;
  capacity: number;
  capacity_unit: 'W' | 'kW' | 'kWh';
  warranty_years?: number;
  data_sheet_url?: string;
  is_active?: boolean;
}

// List components
export async function listComponents(params?: { type?: string; is_active?: boolean }): Promise<Component[]> {
  const query = new URLSearchParams();
  if (params?.type)      query.append('type',      params.type);
  if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
  const res = await apiFetch<{ data: Component[] }>(`/api/components?${query}`, { auth: true });
  return res.data;
}

// Get single component
export async function getComponentById(id: string): Promise<Component> {
  const res = await apiFetch<{ data: Component }>(`/api/components/${id}`, { auth: true });
  return res.data;
}

// Create component (admin)
export async function createComponent(payload: CreateComponentPayload): Promise<Component> {
  const res = await apiFetch<{ data: Component }>('/api/components', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
  return res.data;
}

// Update component (admin)
export async function updateComponent(id: string, payload: Partial<CreateComponentPayload>): Promise<Component> {
  const res = await apiFetch<{ data: Component }>(`/api/components/${id}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
  });
  return res.data;
}
