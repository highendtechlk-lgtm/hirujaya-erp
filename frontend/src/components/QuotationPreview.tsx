import React from 'react';
import { Package } from '../services/packageService';
import { Component } from '../services/componentService';

interface QuotationPreviewProps {
  data: {
    quotationNo: string;
    date: string;
    validityDays: number;
    customer: {
      name: string;
      address: string;
      contact: string;
    };
    bdm: {
      name: string;
      contact?: string;
    };
    systemCapacity: string;
    package: Package | null;
    selectedPanel: Component | null;
    additionalItems: Array<{ item_name: string; qty: number; unit_price_lkr: number }>;
    accessories: Component[];
    finalPrice: number;
  };
}

export function QuotationPreview({ data }: QuotationPreviewProps) {
  const { customer, bdm, package: pkg, selectedPanel, additionalItems, accessories, finalPrice } = data;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div id="quotation-pdf-content" className="bg-white text-gray-800 font-sans leading-normal">
      {/* PAGE 1: COVER & SYSTEM DETAILS */}
      <div className="p-12 min-h-[1120px] relative border-b border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-green flex items-center justify-center rounded-sm font-bold text-white text-2xl">
              E3
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-navy tracking-tight leading-none">HIRUJAYA GREEN ENERGY</h1>
              <p className="text-[10px] tracking-[0.2em] text-brand-navy font-bold mt-1">PURE POWER SOLUTIONS</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-brand-green italic tracking-tighter">QUOTATION</h2>
            <div className="mt-2 text-sm">
              <p className="font-bold text-brand-navy">No: {data.quotationNo}</p>
              <p className="text-gray-500">Date: {formatDate(data.date)}</p>
            </div>
          </div>
        </div>

        {/* Customer & BDM Info Boxes */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="border-l-4 border-brand-green pl-6 py-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Prepared For</h3>
            <p className="text-lg font-bold text-brand-navy">{customer.name}</p>
            <p className="text-sm text-gray-600 mt-1">{customer.address}</p>
            <p className="text-sm text-gray-600">{customer.contact}</p>
          </div>
          <div className="border-l-4 border-brand-navy pl-6 py-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Account Manager</h3>
            <p className="text-lg font-bold text-brand-navy">{bdm.name}</p>
            <p className="text-sm text-gray-600 mt-1">Hirujaya Green Energy Solutions</p>
            <p className="text-sm text-gray-600">Validity: {data.validityDays} Days</p>
          </div>
        </div>

        {/* Hero System Title */}
        <div className="bg-brand-navy text-white p-8 rounded-sm mb-12 flex justify-between items-center">
          <div>
            <h4 className="text-sm font-bold text-brand-green uppercase tracking-widest mb-1">Proposed Solution</h4>
            <h5 className="text-4xl font-black">{data.systemCapacity}kW Solar PV System</h5>
            <p className="text-blue-200 text-sm mt-2">On-Grid Solar Energy Solution for Residential/Commercial Use</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Total Investment</p>
            <p className="text-4xl font-black text-brand-green">LKR {finalPrice.toLocaleString()}</p>
          </div>
        </div>

        {/* Primary Components Table */}
        <div className="mb-12">
          <h6 className="text-sm font-bold text-brand-navy mb-4 border-b pb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-green rounded-full"></span>
            SYSTEM CORE COMPONENTS
          </h6>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-brand-navy text-left uppercase text-[10px] font-black tracking-widest">
                <th className="py-3 px-4">Component Description</th>
                <th className="py-3 px-4">Specifications</th>
                <th className="py-3 px-4 text-center">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-4 px-4 font-bold text-brand-navy">Solar PV Panels</td>
                <td className="py-4 px-4 text-gray-600">
                  {selectedPanel?.brand} {selectedPanel?.model} - {selectedPanel?.capacity}{selectedPanel?.capacity_unit} Monofacial/Bifacial
                </td>
                <td className="py-4 px-4 text-center font-bold">{pkg?.solar_panel.qty} Units</td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-bold text-brand-navy">Solar Inverter</td>
                <td className="py-4 px-4 text-gray-600">
                  {pkg?.inverter.brand} {pkg?.inverter.model} - High Efficiency Grid-Tied Inverter
                </td>
                <td className="py-4 px-4 text-center font-bold">{pkg?.inverter.qty} Unit</td>
              </tr>
              {additionalItems.length > 0 && additionalItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-4 font-bold text-brand-navy">{item.item_name}</td>
                  <td className="py-4 px-4 text-gray-600">Standard Accessory</td>
                  <td className="py-4 px-4 text-center font-bold">{item.qty} Units</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-12 left-12 right-12 text-[10px] text-gray-400 flex justify-between items-center border-t pt-4">
          <p>© 2024 Hirujaya Green Energy Solutions | www.hirujaya.com</p>
          <p>Page 01 of 04</p>
        </div>
      </div>

      {/* PAGE 2: ACCESSORIES & TECHNICAL SPECS */}
      <div className="p-12 min-h-[1120px] relative border-b border-gray-100">
        <h6 className="text-sm font-bold text-brand-navy mb-6 border-b pb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-brand-green rounded-full"></span>
          ACCESSORIES & INSTALLATION MATERIALS
        </h6>
        
        <div className="grid grid-cols-1 gap-6 mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-navy text-white text-left uppercase text-[10px] font-black tracking-widest">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Description / Specification</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border border-gray-100">
              {accessories.length > 0 ? (
                accessories.map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4 font-bold text-brand-navy">{item.brand} {item.model}</td>
                    <td className="py-3 px-4 text-gray-600">Premium quality {item.type?.replace('_', ' ') || 'Accessory'}</td>
                    <td className="py-3 px-4 text-center font-bold text-brand-green">Included</td>
                  </tr>
                ))
              ) : (
                [
                  { name: 'DC Cable', desc: '4mm / 6mm UV Resistant Solar DC Cables', status: 'Included' },
                  { name: 'AC Cable', desc: 'Armored / Flexible AC Copper Cables (Up to 20m)', status: 'Included' },
                  { name: 'Mounting Structure', desc: 'Aluminum Railing with Hot-Dipped Galvanized Brackets', status: 'Included' },
                  { name: 'Protection Devices', desc: 'DC SPD, AC SPD, MCB, RCCB with IP65 Enclosure', status: 'Included' },
                  { name: 'Earthing System', desc: 'Copper Bonded Earth Rods with Earth Pit', status: 'Included' },
                  { name: 'Remote Monitoring', desc: 'Wifi/LAN Integrated Data Logger for Real-time tracking', status: 'Included' },
                  { name: 'Net Metering', desc: 'Process handling with CEB/LECO authorities', status: 'Included' },
                ].map((item, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4 font-bold text-brand-navy">{item.name}</td>
                    <td className="py-3 px-4 text-gray-600">{item.desc}</td>
                    <td className="py-3 px-4 text-center font-bold text-brand-green">{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 p-8 rounded-sm">
          <h6 className="text-xs font-black text-brand-navy uppercase tracking-widest mb-4 block">Installation Services</h6>
          <ul className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-green rounded-full"></div>
              Professional Mechanical Installation
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-green rounded-full"></div>
              Electrical Engineering & Commissioning
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-green rounded-full"></div>
              System Testing and Quality Assurance
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-green rounded-full"></div>
              Post-Installation Maintenance Training
            </li>
          </ul>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-[10px] text-gray-400 flex justify-between items-center border-t pt-4">
          <p>© 2024 Hirujaya Green Energy Solutions | www.hirujaya.com</p>
          <p>Page 02 of 04</p>
        </div>
      </div>

      {/* PAGE 3: PAYMENT SCHEDULE */}
      <div className="p-12 min-h-[1120px] relative border-b border-gray-100">
        <h6 className="text-sm font-bold text-brand-navy mb-6 border-b pb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-brand-green rounded-full"></span>
          PAYMENT MILESTONES
        </h6>

        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between p-6 border border-gray-100 rounded-lg">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold">01</div>
              <div>
                <p className="font-bold text-brand-navy">Advance Payment</p>
                <p className="text-xs text-gray-500">Upon signing the agreement</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">25% of Total</p>
              <p className="text-xl font-bold text-brand-navy">LKR {(finalPrice * 0.25).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border border-gray-100 rounded-lg">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold">02</div>
              <div>
                <p className="font-bold text-brand-navy">Pre-Installation Payment</p>
                <p className="text-xs text-gray-500">Upon delivery of panels & inverter to site</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">50% of Total</p>
              <p className="text-xl font-bold text-brand-navy">LKR {(finalPrice * 0.5).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border border-gray-100 rounded-lg">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold">03</div>
              <div>
                <p className="font-bold text-brand-navy">Final Settlement</p>
                <p className="text-xs text-gray-500">Upon successful commissioning & net-metering</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">25% of Total</p>
              <p className="text-xl font-bold text-brand-navy">LKR {(finalPrice * 0.25).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-6 rounded-sm border border-amber-100 text-xs text-amber-800">
          <p className="font-bold mb-2 uppercase tracking-widest">Important Notes:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Cheques should be drawn in favor of "Hirujaya Green Energy Solutions (Pvt) Ltd".</li>
            <li>Prices are inclusive of standard installation costs within a 50km radius.</li>
            <li>Net metering approval time is subject to CEB/LECO authority procedures.</li>
          </ul>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-[10px] text-gray-400 flex justify-between items-center border-t pt-4">
          <p>© 2024 Hirujaya Green Energy Solutions | www.hirujaya.com</p>
          <p>Page 03 of 04</p>
        </div>
      </div>

      {/* PAGE 4: WARRANTY & CERTIFICATE */}
      <div className="p-12 min-h-[1120px] relative">
        <h6 className="text-sm font-bold text-brand-navy mb-6 border-b pb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-brand-green rounded-full"></span>
          WARRANTY & ASSURANCE
        </h6>

        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-white border border-gray-100 rounded-lg text-center">
            <div className="text-4xl font-black text-brand-green mb-1">25</div>
            <p className="text-xs font-bold text-brand-navy uppercase tracking-widest">Years</p>
            <p className="text-sm font-bold mt-2">Performance Warranty</p>
            <p className="text-xs text-gray-500 mt-1">On Solar PV Panels</p>
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-lg text-center">
            <div className="text-4xl font-black text-brand-green mb-1">10</div>
            <p className="text-xs font-bold text-brand-navy uppercase tracking-widest">Years</p>
            <p className="text-sm font-bold mt-2">Product Warranty</p>
            <p className="text-xs text-gray-500 mt-1">On Inverter System</p>
          </div>
        </div>

        <div className="border-2 border-brand-navy p-12 rounded-sm text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <div className="w-48 h-48 border-8 border-brand-navy rounded-full"></div>
          </div>
          
          <h6 className="text-xl font-bold text-brand-navy mb-2 block tracking-tight">CERTIFICATE OF EXCELLENCE</h6>
          <p className="text-xs text-gray-500 mb-8 uppercase tracking-[0.3em]">Quality Assurance Statement</p>
          
          <p className="text-sm text-gray-700 italic leading-relaxed mb-12">
            "We hereby certify that the solar energy system proposed above utilizes Tier-1 components 
            certified for the highest global standards. Our engineering team ensures that every 
            installation meets the rigorous safety and efficiency benchmarks of Hirujaya Green Energy."
          </p>
          
          <div className="flex justify-around items-end pt-12">
            <div className="text-center">
              <div className="w-32 border-b border-gray-400 mb-2 mx-auto"></div>
              <p className="text-[10px] font-bold text-brand-navy uppercase">Technical Director</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-gray-400 mb-2 mx-auto"></div>
              <p className="text-[10px] font-bold text-brand-navy uppercase">Operations Manager</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-12 right-12 text-[10px] text-gray-400 flex justify-between items-center border-t pt-4">
          <p>© 2024 Hirujaya Green Energy Solutions | www.hirujaya.com</p>
          <p>Page 04 of 04</p>
        </div>
      </div>
    </div>
  );
}
