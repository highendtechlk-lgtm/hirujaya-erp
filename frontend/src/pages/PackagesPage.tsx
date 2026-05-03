import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { listPackages } from "../services/packageService";
import type { Package } from "../services/packageService";

export function PackagesPage() {
  const [items, setItems] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listPackages();
      setItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load packages.");
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Package catalog used for quotations.</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-bold">Name</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">DC Capacity</th>
                <th className="px-6 py-4 font-bold">Price</th>
                <th className="px-6 py-4 font-bold">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No packages found.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{p.name}</td>
                    <td className="px-6 py-4">{p.type}</td>
                    <td className="px-6 py-4">{p.dc_capacity_kw} kW</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(
                        p.system_price_lkr
                      )}{" "}
                      LKR
                    </td>
                    <td className="px-6 py-4">{p.is_active ? "Yes" : "No"}</td>
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

