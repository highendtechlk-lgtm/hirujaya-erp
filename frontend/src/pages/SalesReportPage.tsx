import React, { useEffect, useState } from "react";
import { Download, RefreshCw, BarChart2 } from "lucide-react";
import { getSalesReport, SalesReport } from "../services/reportService";
import API_BASE from "../api/api";

function fmt(amount: number) {
  return new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(amount);
}

export function SalesReportPage() {
  const [data, setData] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSalesReport();
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sales report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDownload = () => {
    const token = localStorage.getItem("hge_token");
    const url = `${API_BASE}/api/reports/sales/export?token=${token}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-green mb-1">
            <BarChart2 size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Financial Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
          <p className="text-sm text-gray-500">Overview of all completed installations and revenue.</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Quotation #</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">System Size</th>
                <th className="px-6 py-4 font-bold">Managed By (BDM)</th>
                <th className="px-6 py-4 font-bold text-right">Final Price (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : !data?.entries?.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No completed sales found.
                  </td>
                </tr>
              ) : (
                data.entries.map((entry, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-navy">
                      {entry.quo_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {entry.customer}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                        {entry.system}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {entry.bdm}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-900">
                      {fmt(entry.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && data && (
              <tfoot className="bg-gray-50 font-bold border-t border-gray-100">
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-gray-500 text-right uppercase tracking-wider text-xs">Total Revenue</td>
                  <td className="px-6 py-4 text-right text-lg text-brand-green">{fmt(data.total_revenue)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
