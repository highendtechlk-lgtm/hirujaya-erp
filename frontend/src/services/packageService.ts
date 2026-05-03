/**
 * packageService.ts
 * Package catalog — list, get, create, update.
 */
import { apiFetch } from '../api/api';

export interface SolarPanel {
  brand: string;
  model: string;
  qty: number;
  warranty_years?: number;
}

export interface Inverter {
  brand: string;
  model: string;
  qty: number;
  phase?: string;
}

export interface Package {
  _id: string;
  name: string;
  type: 'ongrid' | 'hybrid_batteryless' | 'hybrid_with_battery';
  dc_capacity_kw: number;
  solar_panel: SolarPanel;
  inverter: Inverter;
  battery?: object;
  base_price_lkr: number;
  special_offer_percentage?: number;
  is_active: boolean;
}

// List all packages
export async function listPackages(): Promise<Package[]> {
  const res = await apiFetch<{ data: Package[] }>('/api/packages', { auth: true });
  return res.data;
}

// Get single package
export async function getPackageById(id: string): Promise<Package> {
  const res = await apiFetch<{ data: Package }>(`/api/packages/${id}`, { auth: true });
  return res.data;
}
