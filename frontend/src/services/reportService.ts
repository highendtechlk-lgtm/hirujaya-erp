/**
 * reportService.ts
 * Outstanding report, sales report, payroll, and alerts.
 */
import { apiFetch } from '../api/api';

export interface OverdueEntry {
  customer_name: string;
  quotation_id: string;
  amount_lkr: number;
  days_overdue: number;
  status: string;
}

export interface OutstandingReport {
  total_outstanding: number;
  current_month_outstanding: number;
  overdue_30: number;
  overdue_30_60: number;
  overdue_60_plus: number;
  entries: OverdueEntry[];
}

export interface SalesReport {
  total_revenue: number;
  monthly_revenue: number;
  daily_revenue: number;
  prev_month_revenue: number;
  prev_month_collection: number;
  new_collection: number;
  total_prev_months_collection: number;
  this_month_count: number;
  total_installs: number;
  installs_this_month: number;
  trend: { date: string; revenue: number }[];
  entries: {
    date: string;
    quo_number: string;
    customer: string;
    system: string;
    bdm: string;
    amount: number;
  }[];
}

export interface Alert {
  _id: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  createdAt: string;
}

// Get outstanding report (admin / agm)
export async function getOutstandingReport(): Promise<OutstandingReport> {
  const res = await apiFetch<{ data: OutstandingReport }>('/api/reports/outstanding', { auth: true });
  return res.data;
}

// Get sales report (admin / agm), optional date range
export async function getSalesReport(from?: string, to?: string): Promise<SalesReport> {
  const query = new URLSearchParams();
  if (from) query.append('from', from);
  if (to)   query.append('to',   to);
  const res = await apiFetch<{ data: SalesReport }>(`/api/reports/sales?${query}`, { auth: true });
  return res.data;
}

// Generate monthly payroll (admin)
export async function generatePayroll(month: string): Promise<unknown> {
  const res = await apiFetch<{ data: unknown }>('/api/reports/payroll', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ month }),
  });
  return res.data;
}

// Get alerts for current user
export async function getAlerts(unread_only?: boolean): Promise<Alert[]> {
  const query = new URLSearchParams();
  if (unread_only !== undefined) query.append('unread_only', String(unread_only));
  const res = await apiFetch<{ data: Alert[] }>(`/api/reports/alerts?${query}`, { auth: true });
  return res.data;
}

// Mark alert as read
export async function markAlertRead(alertId: string): Promise<void> {
  await apiFetch(`/api/reports/alerts/${alertId}/read`, { method: 'PATCH', auth: true });
}
