import React, { useEffect, useState } from "react";
import { PlusCircle, RefreshCw, FileDown, Eye, X } from "lucide-react";
import { Link } from "react-router-dom";
import { listQuotations, updateQuotationStatus } from "../services/quotationService";
import { QuotationPreview } from "../components/QuotationPreview";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";
import { getStoredUser } from "../api/api";
import type { Quotation } from "../services/quotationService";

export function BdmQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewQuo, setPreviewQuo] = useState<Quotation | null>(null);
  const storedUser = getStoredUser();

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listQuotations();
      setQuotations(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSubmit = async (id: string) => {
    try {
      await updateQuotationStatus(id, "submitted");
      setQuotations((prev) => prev.map((q) => (q._id === id ? { ...q, status: "submitted" } : q)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to submit quotation.");
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('quotation-pdf-content');
    if (!element) {
      alert("PDF content not found ❌");
      return;
    }

    const opt = {
      margin:       0,
      filename:     `Quotation_${previewQuo?.quo_number}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Quotations</h1>
          <p className="text-sm text-gray-500">Create and manage your quotations.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link
            to="/bdm/quotations/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white rounded-lg text-sm font-semibold shadow-sm"
          >
            <PlusCircle size={16} />
            New Quotation
          </Link>
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
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && quotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => {
                  const customerName =
                    typeof q.customer_id === "object" && q.customer_id
                      ? q.customer_id.full_name
                      : "Unknown";
                  const canSubmit = q.status === "draft";
                  return (
                    <tr key={q._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-700 font-semibold">
                        {q.quo_number}
                      </td>
                      <td className="px-6 py-4">{customerName}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(
                          q.total_price_lkr
                        )}{" "}
                        LKR
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {q.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewQuo(q)}
                          className="p-1.5 text-brand-navy hover:bg-gray-100 rounded-md"
                          title="View PDF"
                        >
                          <FileDown size={18} />
                        </button>
                        {canSubmit && (
                          <button
                            type="button"
                            onClick={() => handleSubmit(q._id)}
                            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-brand-green text-white hover:bg-brand-green-hover"
                          >
                            Submit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewQuo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-brand-navy">Quotation: {previewQuo.quo_number}</h3>
                <p className="text-sm text-gray-500">Review and download the document</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-hover transition-colors flex items-center gap-2 shadow-md"
                >
                  <FileDown size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => setPreviewQuo(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-400 p-4 md:p-12 flex justify-center">
              <div className="shadow-2xl bg-white w-[210mm]">
                <QuotationPreview
                  data={{
                    quotationNo: previewQuo.quo_number,
                    date: previewQuo.createdAt,
                    validityDays: 10,
                    customer: {
                      name: typeof previewQuo.customer_id === 'object' ? previewQuo.customer_id?.full_name : 'Customer',
                      address: typeof previewQuo.customer_id === 'object' ? previewQuo.customer_id?.address : '',
                      contact: typeof previewQuo.customer_id === 'object' ? previewQuo.customer_id?.contact_number : '',
                    },
                    bdm: {
                      name: typeof previewQuo.bdm_id === 'object' ? previewQuo.bdm_id?.full_name : (storedUser?.full_name || 'BDM'),
                    },
                    systemCapacity: (previewQuo as any).snapshot?.dc_capacity_kw?.toString() || '0',
                    package: (previewQuo as any).snapshot ? {
                      name: (previewQuo as any).snapshot.package_name,
                      type: (previewQuo as any).snapshot.package_type,
                      solar_panel: { qty: (previewQuo as any).snapshot.selected_panel_count } as any,
                      inverter: (previewQuo as any).snapshot.inverter,
                    } as any : null,
                    selectedPanel: (previewQuo as any).snapshot?.solar_panel || null,
                    additionalItems: previewQuo.additional_items || [],
                    accessories: [], // Accessories are usually in the snapshot or standard
                    finalPrice: previewQuo.final_price_lkr,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

