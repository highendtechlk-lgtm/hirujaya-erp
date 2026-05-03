import React, { useEffect, useState } from "react";
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import { getOutstandingReport, OutstandingReport } from "../services/reportService";
import API_BASE from "../api/api";

function fmt(amount: number) {
  return new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(amount);
}

export function OutstandingReportPage() {
  const [data, setData] = useState<OutstandingReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getOutstandingReport();
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load outstanding report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDownload = () => {
    const token = localStorage.getItem("hge_token");
    const url = `${API_BASE}/api/reports/outstanding/export?token=${token}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <AlertCircle size={20} />
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">Priority Follow-up</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Outstanding Report</h1>
          <p className="text-sm text-gray-500">Track pending balances and overdue accounts.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || !data}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-semibold hover:bg-brand-green-hover transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            Export to Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Outstanding Balance</p>
          <p className="text-2xl font-black text-red-600">{fmt(data?.total_outstanding ?? 0)} <span className="text-xs">LKR</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">This Month Outstanding</p>
          <p className="text-2xl font-black text-gray-900">{fmt(data?.current_month_outstanding ?? 0)} <span className="text-xs">LKR</span></p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Active Debtors</p>
          <p className="text-2xl font-black text-gray-900">{data?.entries?.length ?? 0} <span className="text-xs">Accounts</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Quotation #</th>
                <th className="px-6 py-4 font-bold">Customer Name</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Days Overdue</th>
                <th className="px-6 py-4 font-bold text-right">Balance Due (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : !data?.entries?.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No outstanding payments found. All accounts clear! 🎉
                  </td>
                </tr>
              ) : (
                data.entries.map((entry, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-navy">
                      {entry.quotation_id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {entry.customer_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        entry.status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${entry.days_overdue > 30 ? 'text-red-600' : 'text-gray-700'}`}>
                          {entry.days_overdue} days
                        </span>
                        {entry.days_overdue > 60 && (
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-red-600">
                      {fmt(entry.amount_lkr)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
