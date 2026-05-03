import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getOutstandingReport, getSalesReport } from "../services/reportService";
import type { OutstandingReport, SalesReport } from "../services/reportService";

function fmt(amount: number) {
  return new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(amount);
}

export function ReportsPage() {
  const [outstanding, setOutstanding] = useState<OutstandingReport | null>(null);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [o, s] = await Promise.all([getOutstandingReport(), getSalesReport()]);
      setOutstanding(o);
      setSales(s);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Sales and outstanding overview.</p>
        </div>
        <button
          type="button"
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Outstanding</h2>
          <p className="text-sm text-gray-500 mb-4">Collections and overdue buckets.</p>
          {loading || !outstanding ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total outstanding</span>
                <span className="font-bold text-red-600">{fmt(outstanding.total_outstanding)} LKR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current month outstanding</span>
                <span className="font-bold text-red-600">{fmt(outstanding.current_month_outstanding)} LKR</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-50">
                <span className="text-gray-600">Overdue &gt; 30 days</span>
                <span className="font-semibold text-gray-900">{fmt(outstanding.overdue_30)} LKR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overdue 30–60</span>
                <span className="font-semibold text-gray-900">{fmt(outstanding.overdue_30_60)} LKR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overdue 60+</span>
                <span className="font-semibold text-gray-900">{fmt(outstanding.overdue_60_plus)} LKR</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Sales & Collections</h2>
          <p className="text-sm text-gray-500 mb-4">Revenue and payment summary.</p>
          {loading || !sales ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total revenue (completed)</span>
                <span className="font-semibold text-gray-900">{fmt(sales.total_revenue)} LKR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current month revenue</span>
                <span className="font-semibold text-gray-900">{fmt(sales.monthly_revenue)} LKR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Previous month revenue</span>
                <span className="font-semibold text-gray-900">{fmt(sales.prev_month_revenue)} LKR</span>
              </div>
              
              <div className="flex justify-between text-sm pt-2 border-t border-gray-50">
                <span className="text-gray-600 font-medium">Collections (This Month)</span>
                <span className="font-bold text-brand-green">{fmt(sales.new_collection)} LKR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Collections (Prev. Month)</span>
                <span className="font-semibold text-gray-900">{fmt(sales.prev_month_collection)} LKR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Prev. Collections</span>
                <span className="font-semibold text-gray-900">{fmt(sales.total_prev_months_collection)} LKR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Count (This Month)</span>
                <span className="font-semibold text-gray-900">{sales.this_month_count}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

