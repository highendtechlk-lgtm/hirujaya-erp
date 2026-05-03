import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Banknote,
  AlertCircle,
  Eye,
  Edit2,
  Send,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listQuotations, updateQuotationStatus } from '../services/quotationService';
import { getAlerts, markAlertRead } from '../services/reportService';
import { getStoredUser } from '../api/api';
import type { Quotation } from '../services/quotationService';
import type { Alert } from '../services/reportService';

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtLKR(amount: number) {
  return new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(amount);
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft:      'bg-gray-50 text-gray-600 border-gray-200',
    approved:   'bg-green-50 text-green-600 border-green-200',
    submitted:  'bg-orange-50 text-orange-600 border-orange-200',
    docs_pending: 'bg-purple-50 text-purple-700 border-purple-200',
    active:     'bg-blue-50 text-blue-600 border-blue-200',
    completed:  'bg-teal-50 text-teal-600 border-teal-200',
    overdue:    'bg-red-50 text-red-600 border-red-200',
    cancelled:  'bg-gray-100 text-gray-500 border-gray-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-500 border-gray-200';
}

function alertIcon(type: string) {
  if (type === 'overdue' || type === 'contract_expiring')
    return <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />;
  if (type === 'commission') return <CheckCircle2 className="text-brand-green flex-shrink-0 mt-0.5" size={20} />;
  return <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />;
}

function alertBorder(type: string) {
  if (type === 'overdue' || type === 'contract_expiring') return 'border-red-500 bg-red-50/50';
  if (type === 'commission') return 'border-brand-green bg-green-50/50';
  return 'border-yellow-400 bg-yellow-50/50';
}

// ── Component ─────────────────────────────────────────────────────────────────
export function BDMDashboard() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [alerts, setAlerts]         = useState<Alert[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const storedUser = getStoredUser();
  const userName = storedUser?.full_name ?? 'there';
  const unreadCount = alerts.filter(a => !a.is_read).length;
  const navigate = useNavigate();

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [quotData, alertData] = await Promise.all([
        listQuotations(),
        getAlerts(),
      ]);
      setQuotations(quotData);
      setAlerts(alertData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleMarkRead = async (alertId: string) => {
    try {
      await markAlertRead(alertId);
      setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, is_read: true } : a));
    } catch { /* silent */ }
  };

  const handleSubmit = async (quotationId: string) => {
    try {
      await updateQuotationStatus(quotationId, 'submitted');
      setQuotations(prev => prev.map(q => q._id === quotationId ? { ...q, status: 'submitted' } : q));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit quotation.');
    }
  };

  // Stats derived from live data
  const completedThisMonth = quotations.filter(q => q.status === 'completed').length;
  const overdueCollections = quotations.filter(q => q.status === 'overdue');

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-brand-navy rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">Welcome back, {userName.split(' ')[0]}!</h1>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium">
              <AlertCircle size={16} className="text-red-400" />
              {unreadCount > 0 ? `You have ${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'No unread alerts'}
            </div>
          </div>
          <button 
            onClick={() => navigate('/bdm/quotations/new')}
            className="flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-green/20"
          >
            <Plus size={20} />
            Create New Quotation
          </button>
        </div>
        {/* Decorative Icon */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            <rect x="4" y="8" width="16" height="8" rx="2" />
            <path d="M8 8v8M12 8v8M16 8v8" />
          </svg>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button onClick={fetchAll} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 size={40} className="animate-spin text-brand-green" />
            <p className="text-sm font-medium">Loading your dashboard…</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-green-50 text-brand-green flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Completed Projects This Month</p>
                  <h3 className="text-4xl font-bold text-gray-900">{String(completedThisMonth).padStart(2, '0')}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                  <Banknote size={32} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Quotations</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-bold text-gray-900">{quotations.length}</h3>
                    <span className="text-gray-500 font-medium">quotes</span>
                  </div>
                  <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                    {quotations.filter(q => q.status === 'active').length} Active
                  </span>
                </div>
              </div>
            </div>

            {/* My Quotations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">My Quotations</h3>
                <button
                  onClick={fetchAll}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-green hover:text-brand-green-hover"
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 font-bold">Quo #</th>
                      <th className="px-6 py-4 font-bold">Customer</th>
                      <th className="px-6 py-4 font-bold">Final Price</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quotations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                          No quotations found. Create your first one!
                        </td>
                      </tr>
                    ) : (
                      quotations.map((q) => {
                        const customerName = typeof q.customer_id === 'object' && q.customer_id !== null
                          ? q.customer_id.full_name
                          : 'Unknown Customer';
                        const isDraft = q.status === 'draft';
                        return (
                          <tr key={q._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-500">{q.quotation_id}</td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">{customerName}</div>
                              <div className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">
                              {fmtLKR(q.total_price_lkr)} LKR
                            </td>
                            <td className="px-6 py-4">
                              <span className={`border px-2.5 py-1 rounded-md text-xs font-bold uppercase ${statusBadge(q.status)}`}>
                                {q.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button className="text-gray-400 hover:text-brand-navy p-1" title="View">
                                  <Eye size={18} />
                                </button>
                                {isDraft && (
                                  <>
                                    <button className="text-gray-400 hover:text-brand-navy p-1" title="Edit">
                                      <Edit2 size={18} />
                                    </button>
                                    <button
                                      onClick={() => handleSubmit(q._id)}
                                      className="text-gray-400 hover:text-brand-green p-1"
                                      title="Submit"
                                    >
                                      <Send size={18} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Sustainable Success</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Hirunjaya Green Energy is committed to leading the renewable energy transition in Sri Lanka.
                  Your performance this month has contributed to a carbon offset of approximately 14.5 metric tons.
                </p>
              </div>
              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=400"
                  alt="Solar Farm"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-8">
            {/* Live Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Live Alerts</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No alerts at this time 🎉</p>
                ) : (
                  alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert._id}
                      onClick={() => !alert.is_read && handleMarkRead(alert._id)}
                      className={`flex gap-4 p-4 border-l-4 rounded-r-lg cursor-pointer transition-opacity ${alertBorder(alert.type)} ${alert.is_read ? 'opacity-50' : ''}`}
                    >
                      {alertIcon(alert.type)}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1 capitalize">{alert.type.replace('_', ' ')}</h4>
                        <p className="text-xs text-gray-700">{alert.message}</p>
                        {!alert.is_read && <span className="text-[10px] text-gray-400 mt-1">Click to mark as read</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Outstanding Collections */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Outstanding Collections</h3>

              <div className="space-y-4 mb-6">
                {overdueCollections.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No outstanding collections 🎉</p>
                ) : (
                  overdueCollections.map((q) => {
                    const customerName = typeof q.customer_id === 'object' && q.customer_id !== null
                      ? q.customer_id.full_name
                      : 'Unknown Customer';
                    return (
                      <div key={q._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{customerName}</h4>
                          <p className="text-xs text-gray-500">{q.quotation_id}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-red-600">{fmtLKR(q.total_price_lkr)} LKR</div>
                          <div className="text-xs text-red-500">Overdue</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <button className="w-full py-2.5 border border-gray-300 text-brand-navy font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                Review All Outstanding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
