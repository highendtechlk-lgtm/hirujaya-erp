import React, { useState, useEffect } from 'react';
import {
  Banknote,
  Wallet,
  ClipboardList,
  AlertCircle,
  Factory,
  CalendarDays,
  History,
  Users,
  BookOpen,
  Megaphone,
  Loader2,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSalesReport, getOutstandingReport, getAlerts, generatePayroll } from '../services/reportService';
import { listQuotations } from '../services/quotationService';
import type { SalesReport, OutstandingReport, OverdueEntry, Alert } from '../services/reportService';
import type { Quotation } from '../services/quotationService';

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(amount);
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    draft:      'bg-gray-100 text-gray-600',
    completed:  'bg-green-100 text-green-700',
    approved:   'bg-blue-100 text-blue-700',
    docs_pending: 'bg-purple-100 text-purple-700',
    active:     'bg-teal-100 text-teal-700',
    submitted:  'bg-orange-100 text-orange-700',
    overdue:    'bg-red-100 text-red-700',
    cancelled:  'bg-gray-100 text-gray-500',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [sales, setSales]               = useState<SalesReport | null>(null);
  const [outstanding, setOutstanding]   = useState<OutstandingReport | null>(null);
  const [quotations, setQuotations]     = useState<Quotation[]>([]);
  const [alerts, setAlerts]             = useState<Alert[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollMsg, setPayrollMsg]     = useState('');
  const navigate = useNavigate();

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [salesData, outData, quotData, alertData] = await Promise.all([
        getSalesReport(),
        getOutstandingReport(),
        listQuotations(),
        getAlerts(),
      ]);
      setSales(salesData);
      setOutstanding(outData);
      setQuotations(quotData);
      setAlerts(alertData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handlePayroll = async () => {
    const month = new Date().toISOString().slice(0, 7); // e.g. "2026-05"
    setPayrollLoading(true);
    setPayrollMsg('');
    try {
      await generatePayroll(month);
      setPayrollMsg(`✅ Payroll for ${month} generated!`);
    } catch (err: unknown) {
      setPayrollMsg(err instanceof Error ? `❌ ${err.message}` : '❌ Payroll failed.');
    } finally {
      setPayrollLoading(false);
    }
  };

  // Overdue quotations from outstanding report
  const overdueEntries: OverdueEntry[] = outstanding?.entries ?? [];

  // Bar chart: use trend data or fallback to empty bars
  const trendBars = (sales?.trend?.length ? sales.trend : Array(13).fill({ revenue: 0 }));
  const maxRevenue = Math.max(...trendBars.map(t => t.revenue), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy mb-1">
            HIRUNJAYA GREEN ENERGY
          </h1>
          <p className="text-gray-500 text-sm">
            Operations Dashboard • Real-time metrics and financial overview
          </p>
          {payrollMsg && (
            <p className="text-sm mt-1 font-medium text-brand-green">{payrollMsg}</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-4 py-2.5 border border-brand-navy text-brand-navy font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserPlus size={18} />
            Create New Account
          </button>
          <button
            onClick={handlePayroll}
            disabled={payrollLoading}
            className="flex items-center gap-2 px-4 py-2.5 border border-brand-navy text-brand-navy font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {payrollLoading ? <Loader2 size={18} className="animate-spin" /> : <History size={18} />}
            Run Month-End Payroll
          </button>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-hover transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 size={40} className="animate-spin text-brand-green" />
            <p className="text-sm font-medium">Loading dashboard data…</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Day Revenue (Collections Overview) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-brand-green flex items-center justify-center">
                  <Banknote size={20} />
                </div>
                <span className="bg-green-100 text-brand-green text-xs font-bold px-2 py-1 rounded-full">Collections</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">Previous Month Collection</p>
                  <p className="text-lg font-bold text-gray-900">{fmt(sales?.prev_month_collection ?? 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">New Collection (This Month)</p>
                  <p className="text-lg font-bold text-brand-green">{fmt(sales?.new_collection ?? 0)}</p>
                </div>
                <div className="pt-2 border-t border-gray-50 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Prev. Total</p>
                    <p className="text-sm font-bold text-gray-700">{fmt(sales?.total_prev_months_collection ?? 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Month Count</p>
                    <p className="text-sm font-bold text-gray-700">{sales?.this_month_count ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wallet size={20} />
                </div>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">Revenue</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Previous Month</p>
                  <h3 className="text-xl font-bold text-gray-700">{fmt(sales?.prev_month_revenue ?? 0)}</h3>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">New Month (Current)</p>
                  <h3 className="text-2xl font-bold text-gray-900">{fmt(sales?.monthly_revenue ?? 0)}</h3>
                </div>
              </div>
            </div>

            {/* Monthly Outstanding */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <ClipboardList size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Current Month Outstanding</p>
                <h3 className="text-2xl font-bold text-red-600">{fmt(outstanding?.current_month_outstanding ?? 0)}</h3>
              </div>
            </div>

            {/* Total Outstanding */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
                <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">High Priority</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Outstanding</p>
                <h3 className="text-2xl font-bold text-red-600">{fmt(outstanding?.total_outstanding ?? 0)}</h3>
              </div>
            </div>

            {/* Total Site Installs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <Factory size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Total Site Installs</p>
                <h3 className="text-2xl font-bold text-gray-900">{sales?.total_installs ?? 0}</h3>
              </div>
            </div>

            {/* Sites This Month */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 text-brand-green flex items-center justify-center">
                  <CalendarDays size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Sites This Month</p>
                <h3 className="text-2xl font-bold text-gray-900">{sales?.installs_this_month ?? 0}</h3>
              </div>
            </div>

            {/* Overdue > 30 Days */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <History size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Overdue {'>'} 30 Days</p>
                <h3 className="text-2xl font-bold text-gray-900">{fmt(outstanding?.overdue_30 ?? 0)}</h3>
              </div>
            </div>

            {/* Overdue Count */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Overdue Count</p>
                <h3 className="text-2xl font-bold text-gray-900">{String(overdueEntries.length).padStart(2, '0')}</h3>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Revenue Trend (30 Days)</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                  Generation
                </div>
              </div>

              <div className="h-64 flex items-end justify-between gap-2 pt-4">
                {trendBars.map((bar, i) => {
                  const pct = Math.round(((bar.revenue ?? 0) / maxRevenue) * 100);
                  return (
                    <div key={i} className="w-full flex flex-col justify-end h-full" title={`LKR ${bar.revenue ?? 0}`}>
                      <div
                        className={`w-full rounded-t-sm ${i % 2 === 0 ? 'bg-blue-50' : 'bg-brand-green'}`}
                        style={{ height: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-4 font-medium">
                <span>{trendBars[0]?.date ?? 'Start'}</span>
                <span>{trendBars[Math.floor(trendBars.length / 2)]?.date ?? 'Mid'}</span>
                <span>{trendBars[trendBars.length - 1]?.date ?? 'End'}</span>
              </div>
            </div>

            {/* Outstanding by Age */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Outstanding by Age</h3>
              <div className="space-y-6">
                {[
                  { label: '0-30 days',   value: outstanding?.overdue_30 ?? 0,      color: 'bg-brand-navy', max: outstanding?.total_outstanding ?? 1 },
                  { label: '30-60 days',  value: outstanding?.overdue_30_60 ?? 0,   color: 'bg-blue-400',   max: outstanding?.total_outstanding ?? 1 },
                  { label: '60+ days',    value: outstanding?.overdue_60_plus ?? 0, color: 'bg-red-400',    max: outstanding?.total_outstanding ?? 1 },
                ].map(({ label, value, color, max }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className="font-bold text-gray-900">{fmt(value)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`${color} h-2.5 rounded-full`}
                        style={{ width: `${Math.round((value / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  "Focus collections effort on accounts over 30 days to maintain optimal cash flow."
                </p>
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overdue Customers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Overdue Customers</h3>
                <span className="text-xs text-gray-400 font-medium">{overdueEntries.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 font-bold">Customer Name</th>
                      <th className="px-6 py-4 font-bold">Quotation #</th>
                      <th className="px-6 py-4 font-bold">Amount</th>
                      <th className="px-6 py-4 font-bold">Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {overdueEntries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                          No overdue customers 🎉
                        </td>
                      </tr>
                    ) : (
                      overdueEntries.map((e, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{e.customer_name}</td>
                          <td className="px-6 py-4 text-gray-500">{e.quotation_id}</td>
                          <td className={`px-6 py-4 font-bold ${e.days_overdue > 30 ? 'text-red-600' : 'text-orange-500'}`}>{fmt(e.amount_lkr)}</td>
                          <td className={`px-6 py-4 font-medium ${e.days_overdue > 30 ? 'text-red-600' : 'text-orange-500'}`}>{e.days_overdue}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Quotations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Recent Quotations</h3>
                <span className="text-xs text-gray-400 font-medium">{quotations.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 font-bold">BDM</th>
                      <th className="px-6 py-4 font-bold">Quote #</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quotations.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-400 text-sm">
                          No quotations yet
                        </td>
                      </tr>
                    ) : (
                      quotations.slice(0, 5).map((q) => {
                        const bdmName = typeof q.bdm_id === 'object' && q.bdm_id !== null
                          ? q.bdm_id.full_name
                          : 'Unknown';
                        return (
                          <tr key={q._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                  {initials(bdmName)}
                                </div>
                                <span className="font-medium text-gray-900">{bdmName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{q.quotation_id}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusColor(q.status)}`}>
                                {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Alerts Row */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Megaphone size={20} className="text-brand-green" />
                Active Alerts ({alerts.filter(a => !a.is_read).length} unread)
              </h3>
              <div className="space-y-2">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert._id} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.is_read ? 'bg-gray-50 border-gray-100 text-gray-400' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span className="text-sm">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions Footer */}
          <div className="bg-brand-navy rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-lg mb-1">Administrative Quick Actions</h3>
              <p className="text-gray-400 text-sm">Update system catalog and manage operational permissions</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button 
                onClick={() => navigate('/register')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-navy-light hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors border border-white/10"
              >
                <UserPlus size={18} />
                Create Account
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-navy-light hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors border border-white/10">
                <BookOpen size={18} />
                Manage Catalog
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-navy-light hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors border border-white/10">
                <Megaphone size={18} />
                View All Alerts
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
