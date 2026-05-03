import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Users,
  Banknote,
  Calendar,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Trash2,
  FileDown,
  Eye,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuotationPreview } from '../components/QuotationPreview';
import { listPackages } from '../services/packageService';
import { listCustomers, createCustomer } from '../services/customerService';
import { listComponents } from '../services/componentService';
import { createQuotation } from '../services/quotationService';
import { getStoredUser } from '../api/api';
import type { Package } from '../services/packageService';
import type { Customer } from '../services/customerService';
import type { Component } from '../services/componentService';
// @ts-ignore
import html2pdf from "html2pdf.js/dist/html2pdf.bundle.min.js";

interface AdditionalItem {
  item_name: string;
  qty: number;
  unit_price_lkr: number;
}

export function CreateQuotationPage() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();

  // ── Catalog data ─────────────────────────────────────────────────────────────
  const [packages, setPackages]     = useState<Package[]>([]);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [panels, setPanels]         = useState<Component[]>([]);
  const [accessories, setAccessories] = useState<Component[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError]     = useState('');

  // ── Form state — Customer ─────────────────────────────────────────────────────
  const [customerMode, setCustomerMode] = useState<'new' | 'existing'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [fullName, setFullName]       = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress]         = useState('');
  const [email, setEmail]             = useState('');

  // ── Form state — Package & Panel ──────────────────────────────────────────────
  const [selectedPackageId, setSelectedPackageId]   = useState('');
  const [selectedPanelId, setSelectedPanelId]       = useState('');
  const [additionalItems, setAdditionalItems]       = useState<AdditionalItem[]>([]);

  // ── Submission state ──────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [validityDays, setValidityDays] = useState(10);
  const [quotationNo] = useState(`KL/26/${Math.floor(1000 + Math.random() * 9000)}`);

  // ── Derived: selected package details ─────────────────────────────────────────
  const selectedPkg = packages.find(p => p._id === selectedPackageId);
  const discount = selectedPkg
    ? Math.round((selectedPkg.base_price_lkr ?? 0) * (selectedPkg.special_offer_percentage ?? 0) / 100)
    : 0;
  const additionalTotal = additionalItems.reduce((s, i) => s + i.qty * i.unit_price_lkr, 0);
  const finalPrice = selectedPkg
    ? (selectedPkg.base_price_lkr ?? 0) + additionalTotal - discount
    : 0;
  const commitment25 = Math.round(finalPrice * 0.25);

  // ── Load catalog on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setCatalogLoading(true);
      setCatalogError('');
      try {
        const [pkgData, custData, componentData] = await Promise.all([
          listPackages(),
          listCustomers({ limit: 100 }),
          listComponents({ is_active: true }),
        ]);
        setPackages(pkgData);
        setCustomers(custData.customers);
        setPanels(componentData.filter((c: Component) => c.type === 'panel' || c.type === 'solar_panel'));
        setAccessories(componentData.filter((c: Component) => c.type !== 'panel' && c.type !== 'solar_panel' && c.type !== 'inverter'));
      } catch (err: unknown) {
        setCatalogError(err instanceof Error ? err.message : 'Failed to load catalog data.');
      } finally {
        setCatalogLoading(false);
      }
    })();
  }, []);

  // ── Additional items helpers ──────────────────────────────────────────────────
  const addItem = () => setAdditionalItems(prev => [...prev, { item_name: '', qty: 1, unit_price_lkr: 0 }]);
  const removeItem = (i: number) => setAdditionalItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof AdditionalItem, value: string | number) =>
    setAdditionalItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    if (!selectedPackageId) { setSubmitError('Please select a package.'); return; }
    if (!selectedPanelId)   { setSubmitError('Please select a solar panel component.'); return; }

    setSubmitting(true);
    try {
      let customerId = selectedCustomerId;

      // If new customer mode, create the customer first
      if (customerMode === 'new') {
        const newCustomer = await createCustomer({ full_name: fullName, contact_number: contactNumber, address, email: email || undefined });
        customerId = newCustomer._id;
      }

      const quotation = await createQuotation({
        customer_id: customerId,
        package_id: selectedPackageId,
        chosen_panel_component_id: selectedPanelId,
        additional_items: additionalItems.filter(i => i.item_name.trim()),
      });

      setSubmitSuccess(`Quotation ${quotation.quo_number} created successfully!`);
      setTimeout(() => navigate('/bdm/quotations'), 2000);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create quotation.');
    } finally {
      setSubmitting(false);
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
      filename:     `Quotation_${quotationNo}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  if (catalogLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={40} className="animate-spin text-brand-green" />
          <p className="text-sm font-medium">Loading catalog data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Dashboard / Quotations / <span className="text-brand-navy">New</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Quotation</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 md:flex-none px-6 py-2.5 border border-gray-300 text-brand-navy font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="quotation-form"
            disabled={submitting}
            className="flex-1 md:flex-none px-6 py-2.5 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-hover transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            Submit Quotation
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!selectedPackageId || !selectedPanelId}
            className="flex-1 md:flex-none px-6 py-2.5 bg-brand-navy text-white font-semibold rounded-lg hover:bg-brand-navy-light transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            <Eye size={16} />
            Preview & PDF
          </button>
        </div>
      </div>

      {/* Catalog error */}
      {catalogError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={16} className="shrink-0" />
          {catalogError}
        </div>
      )}

      {/* Submit feedback */}
      {submitError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
          <AlertCircle size={16} className="shrink-0" />
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-6 py-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="shrink-0" />
            <span className="font-bold">{submitSuccess}</span>
          </div>
          <button 
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-bold text-xs"
          >
            <FileDown size={14} />
            Download PDF Copy
          </button>
        </div>
      )}

      <form id="quotation-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-8">

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-brand-navy font-bold text-lg">
                  <User size={20} className="text-brand-green" />
                  Customer Information
                </div>
                {/* Toggle new vs existing */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setCustomerMode('new')}
                    className={`px-4 py-1.5 transition-colors ${customerMode === 'new' ? 'bg-brand-green text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    New
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('existing')}
                    className={`px-4 py-1.5 transition-colors ${customerMode === 'existing' ? 'bg-brand-green text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Existing
                  </button>
                </div>
              </div>

              {customerMode === 'existing' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Customer</label>
                  <div className="relative">
                    <select
                      value={selectedCustomerId}
                      onChange={e => setSelectedCustomerId(e.target.value)}
                      required
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all appearance-none bg-white"
                    >
                      <option value="" disabled>-- Select a customer --</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.full_name} — {c.contact_number}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Enter full name"
                        required={customerMode === 'new'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Number</label>
                      <input
                        type="text"
                        value={contactNumber}
                        onChange={e => setContactNumber(e.target.value)}
                        placeholder="+94 XX XXX XXXX"
                        required={customerMode === 'new'}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Street address, city"
                      required={customerMode === 'new'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address (optional)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="client@example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={new Date().toLocaleDateString()}
                          className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* System Specification — Package Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-lg mb-8">
                <Settings size={20} className="text-brand-green" />
                System Specification
              </div>

              {/* Package selector */}
              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Package</label>
                <div className="relative">
                  <select
                    value={selectedPackageId}
                    onChange={e => setSelectedPackageId(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    <option value="" disabled>-- Select a package --</option>
                    {packages.map(pkg => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.name} — {pkg.dc_capacity_kw} kW — LKR {pkg.base_price_lkr.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Show selected package details */}
              {selectedPkg && (
                <>
                  <div className="border border-gray-100 rounded-xl p-6 mb-6 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-brand-navy mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-1 h-4 bg-brand-green rounded-full"></div>
                      Solar Panel Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                      <div><span className="font-bold">Brand:</span> {selectedPkg.solar_panel.brand}</div>
                      <div><span className="font-bold">Model:</span> {selectedPkg.solar_panel.model}</div>
                      <div><span className="font-bold">Qty:</span> {selectedPkg.solar_panel.qty}</div>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-6 mb-6 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-brand-navy mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-1 h-4 bg-brand-green rounded-full"></div>
                      Inverter Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                      <div><span className="font-bold">Brand:</span> {selectedPkg.inverter.brand}</div>
                      <div><span className="font-bold">Model:</span> {selectedPkg.inverter.model}</div>
                      <div><span className="font-bold">Qty:</span> {selectedPkg.inverter.qty}</div>
                    </div>
                  </div>
                </>
              )}

              {/* Panel component selector */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Choose Panel Component</label>
                <div className="relative">
                  <select
                    value={selectedPanelId}
                    onChange={e => setSelectedPanelId(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all appearance-none bg-white"
                  >
                    {(() => {
                      const allowedPanelIds = selectedPkg?.solar_panel?.allowed_brands?.map(b => 
                        typeof b.component_id === 'string' ? b.component_id : (b.component_id as any)?._id
                      ) || [];
                      
                      const filteredPanels = allowedPanelIds.length > 0 
                        ? panels.filter(p => allowedPanelIds.includes(p._id))
                        : panels;
                      
                      return (
                        <>
                          <option value="" disabled>-- Select panel component --</option>
                          {filteredPanels.map(p => (
                            <option key={p._id} value={p._id}>{p.brand} {p.model} — {p.capacity} {p.capacity_unit}</option>
                          ))}
                        </>
                      );
                    })()}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Additional Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Additional Items</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs font-semibold text-brand-green hover:text-brand-green-hover"
                  >
                    <PlusCircle size={14} /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {additionalItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-5 gap-3 items-center">
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={e => updateItem(i, 'item_name', e.target.value)}
                        placeholder="Item name"
                        className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-green outline-none"
                      />
                      <input
                        type="number"
                        value={item.qty}
                        onChange={e => updateItem(i, 'qty', Number(e.target.value))}
                        min={1}
                        placeholder="Qty"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-green outline-none"
                      />
                      <input
                        type="number"
                        value={item.unit_price_lkr}
                        onChange={e => updateItem(i, 'unit_price_lkr', Number(e.target.value))}
                        placeholder="Unit price"
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-green outline-none"
                      />
                      <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 flex justify-center">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Team Assignment */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-lg mb-6">
                <Users size={20} className="text-brand-green" />
                Team Assignment
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex items-center justify-center bg-brand-navy text-white font-bold text-sm">
                    {storedUser?.full_name ? storedUser.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'BDM'}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Logged in as BDM</div>
                    <div className="font-bold text-brand-navy">{storedUser?.full_name ?? 'You'}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">AGM & RM will be assigned by Admin after submission</p>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-lg mb-6">
                <Banknote size={20} className="text-brand-green" />
                Pricing Summary
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">System Base Price</span>
                  <span className="font-bold text-gray-900">
                    {selectedPkg ? `LKR ${selectedPkg.base_price_lkr.toLocaleString()}` : '—'}
                  </span>
                </div>
                {additionalTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Additional Items</span>
                    <span className="font-bold text-gray-900">LKR {additionalTotal.toLocaleString()}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Seasonal Offer ({selectedPkg?.special_offer_percentage}% off)
                    </span>
                    <span className="font-bold text-red-500">- LKR {discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commitment Fee (25%)</span>
                  <span className="font-bold text-gray-900">
                    {selectedPkg ? `LKR ${commitment25.toLocaleString()}` : '—'}
                  </span>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="text-[10px] font-bold text-brand-green uppercase tracking-wider mb-1">Final Investment</div>
                  <div className="text-3xl font-bold text-brand-navy">
                    {selectedPkg ? `LKR ${finalPrice.toLocaleString()}` : '—'}
                  </div>
                </div>
              </div>

              {/* Completion progress */}
              {(() => {
                const fields = [fullName || selectedCustomerId, selectedPackageId, selectedPanelId, address || selectedCustomerId];
                const filled = fields.filter(Boolean).length;
                const pct = Math.round((filled / fields.length) * 100);
                return (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      <span>Quotation Completion</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                      <div className="bg-brand-green h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 italic">
                      <span className="text-brand-green font-bold not-italic">{pct}% COMPLETE</span>
                      {pct < 100 && <span>Fill all required fields</span>}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-brand-navy">Quotation Preview</h3>
                <p className="text-sm text-gray-500">Review the generated document before downloading</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="px-6 py-2 bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-hover transition-colors flex items-center gap-2 shadow-md shadow-brand-green/20"
                >
                  <FileDown size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-400 p-4 md:p-12 flex justify-center">
              <div className="shadow-2xl bg-white origin-top scale-90 md:scale-100 w-[210mm]">
                <QuotationPreview
                  data={{
                    quotationNo,
                    date: new Date().toISOString(),
                    validityDays,
                    customer: {
                      name: (() => {
                        const selectedCustomer = customers.find(c => c._id === selectedCustomerId);
                        return selectedCustomer?.full_name || fullName || 'Customer';
                      })(),
                      address: customerMode === 'existing'
                        ? customers.find(c => c._id === selectedCustomerId)?.address || ''
                        : address,
                      contact: customerMode === 'existing'
                        ? customers.find(c => c._id === selectedCustomerId)?.contact_number || ''
                        : contactNumber,
                    },
                    bdm: {
                      name: storedUser?.full_name || 'BDM Name',
                    },
                    systemCapacity: selectedPkg?.dc_capacity_kw?.toString() || '0',
                    package: selectedPkg || null,
                    selectedPanel: panels.find(p => p._id === selectedPanelId) || null,
                    additionalItems,
                    accessories,
                    finalPrice,
                  }}
                />
              </div>
            </div>
            
            <div className="p-4 bg-white border-t flex justify-center">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">Validity (Days):</label>
                <input 
                  type="number" 
                  value={validityDays}
                  onChange={e => setValidityDays(Number(e.target.value))}
                  className="w-20 px-3 py-1 border rounded-md focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}