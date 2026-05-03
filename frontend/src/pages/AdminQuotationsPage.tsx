import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { listQuotations } from "../services/quotationService";
import type { Quotation } from "../services/quotationService";

const STATUSES: Array<Quotation["status"] | "all"> = [
  "all",
  "draft",
  "submitted",
  "approved",
  "docs_pending",
  "active",
  "completed",
  "overdue",
  "cancelled",
];

export function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Quotation["status"] | "all">("all");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listQuotations(status === "all" ? undefined : { status });
      setQuotations(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const rows = useMemo(() => quotations, [quotations]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-sm text-gray-500">View and track all quotations.</p>
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Quotation["status"] | "all")}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All" : s.replace("_", " ")}
            </option>
          ))}
        </select>
        <div className="ml-auto text-sm text-gray-500">
          {loading ? "Loading…" : `${rows.length} record(s)`}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-bold">Quo #</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Package</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                rows.map((q) => {
                  const customerName =
                    typeof q.customer_id === "object" && q.customer_id
                      ? q.customer_id.full_name
                      : q.customer_id;
                  const packageName =
                    typeof q.package_id === "object" && q.package_id
                      ? q.package_id.name
                      : q.package_id;
                  return (
                    <tr key={q._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-700 font-semibold">
                        {q.quotation_id}
                      </td>
                      <td className="px-6 py-4">{customerName || "—"}</td>
                      <td className="px-6 py-4">{packageName || "—"}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {new Intl.NumberFormat("en-LK", {
                          maximumFractionDigits: 0,
                        }).format(q.total_price_lkr)}{" "}
                        LKR
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {q.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(q.createdAt).toLocaleDateString()}
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
  );
}
