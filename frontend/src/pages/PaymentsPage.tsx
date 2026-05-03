import React, { useState } from "react";
import { Banknote } from "lucide-react";
import { recordPayment } from "../services/paymentService";

export function PaymentsPage() {
  const [quotationId, setQuotationId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "cheque" | "bank_transfer">("cash");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await recordPayment({
        quotation_id: quotationId.trim(),
        amount_lkr: Number(amount),
        payment_method: method,
        payment_date: paymentDate,
        reference_number: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setMsg("Payment recorded.");
      setQuotationId("");
      setAmount("");
      setReference("");
      setNotes("");
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500">Record payments against quotations.</p>
      </div>

      {msg && (
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700">
          {msg}
        </div>
      )}

      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Quotation ID
            </label>
            <input
              value={quotationId}
              onChange={(e) => setQuotationId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-green"
              placeholder="QUO-000123"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Amount (LKR)
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="0"
              step="1"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-green"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as "cash" | "cheque" | "bank_transfer")}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand-green"
              disabled={loading}
            >
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Date
            </label>
            <input
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              type="date"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-green"
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Reference (optional)
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-green"
              disabled={loading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-green min-h-[110px]"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-5 py-3 bg-brand-green hover:bg-brand-green-hover text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Banknote size={18} />
          {loading ? "Saving…" : "Record Payment"}
        </button>
      </form>
    </div>
  );
}
