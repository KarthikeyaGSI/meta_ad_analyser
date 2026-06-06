'use client';

import { motion } from 'framer-motion';
import { Palette, Printer, Building2, Upload, FileText } from 'lucide-react';
import React, { useRef } from 'react';
import { useStore } from '../../../client/store/useStore';
import NeumorphismButton from '../../../client/components/NeumorphismButton';
import { formatCurrency, formatPercent, formatRoas } from '../../../shared/utils/formatters';

export default function WhiteLabelPage() {
  const { brandColor, setBrandColor, agencyName, setAgencyName, isPremium, isDemoMode } = useStore();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const colors = [
    { id: 'orange', class: 'bg-orange-500' },
    { id: 'violet', class: 'bg-violet-500' },
    { id: 'emerald', class: 'bg-emerald-500' },
    { id: 'ocean', class: 'bg-blue-500' },
    { id: 'obsidian', class: 'bg-slate-800' },
  ] as const;

  if (!isPremium) return null; // Guarded by Sidebar UpgradeModal

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER - Hidden when printing */}
      <div className="print:hidden">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Palette className="w-8 h-8 text-primary" />
          White-Label Reporting
        </h1>
        <p className="text-muted mt-1">Customize client dashboards and generate branded PDF reports.</p>
      </div>

      {/* SETTINGS PANELS - Hidden when printing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
        <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Agency Branding
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Agency Name</label>
              <input 
                type="text" 
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary focus:outline-none transition-colors"
                placeholder="Enter your agency name..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 mt-4">Brand Accent Color</label>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setBrandColor(color.id)}
                    className={`w-10 h-10 rounded-full ${color.class} ${brandColor === color.id ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' : 'opacity-50 hover:opacity-100'} transition-all`}
                  />
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <label className="block text-xs font-bold text-slate-400 mb-2">Agency Logo (Optional)</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer group">
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                <span className="text-xs text-muted-foreground font-medium">Click to upload logo (PNG/SVG)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-xl flex flex-col justify-center items-center text-center space-y-6">
          <FileText className="w-16 h-16 text-primary opacity-50" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Export Client PDF</h3>
            <p className="text-sm text-muted">Generate a clean, high-converting performance report stripping out all Vero branding.</p>
          </div>
          <NeumorphismButton onClick={handlePrint} className="w-full max-w-xs flex justify-center">
            <Printer className="w-4 h-4" />
            Generate PDF Report
          </NeumorphismButton>
        </div>
      </div>

      {/* PRINTABLE REPORT PREVIEW */}
      <div className="mt-12 bg-white text-black p-10 rounded-xl shadow-2xl print:m-0 print:p-0 print:shadow-none print:w-full max-w-4xl mx-auto" ref={printRef}>
        <div className="flex justify-between items-end border-b-2 border-black/10 pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter" style={{ color: `var(--brand-${brandColor})` }}>
              {agencyName}
            </h1>
            <p className="text-sm font-bold text-gray-500 tracking-widest uppercase mt-2">Executive Performance Audit</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">Generated</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Dynamic Report Data */}
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-400 text-sm">Account Overview</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Spend</p>
                <p className="text-2xl font-black">{isDemoMode ? '$12,450.50' : '$0.00'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="text-2xl font-black text-emerald-600">{isDemoMode ? '$38,590.20' : '$0.00'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Blended ROAS</p>
                <p className="text-2xl font-black" style={{ color: `var(--brand-${brandColor})` }}>{isDemoMode ? '3.1x' : '0.0x'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-400 text-sm">Top Performing Creatives</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black/10 text-xs uppercase tracking-wider text-gray-400 font-bold">
                  <th className="py-3 px-2">Creative Name</th>
                  <th className="py-3 px-2 text-right">Spend</th>
                  <th className="py-3 px-2 text-right">ROAS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 font-semibold">UGC Unboxing TikTok Style</td>
                  <td className="py-3 px-2 text-right font-mono">$4,250</td>
                  <td className="py-3 px-2 text-right font-bold text-emerald-600">3.4x</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-2 font-semibold">Carousel Product Highlight</td>
                  <td className="py-3 px-2 text-right font-mono">$1,800</td>
                  <td className="py-3 px-2 text-right font-bold text-emerald-600">1.8x</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 mt-8">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: `var(--brand-${brandColor})` }}>Agency Automation Note</h4>
            <p className="text-sm leading-relaxed text-gray-600">
              During this period, our deterministic AI guardrails automatically paused 3 fatiguing ad sets before they became unprofitable, saving an estimated $1,240 in wasted ad spend. 
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center text-xs font-bold text-gray-300 uppercase tracking-widest border-t border-gray-100 pt-8">
          Confidential & Proprietary • Powered by {agencyName}
        </div>
      </div>
      
      {/* Hide exact generic print styles globally if needed, handled via Tailwind print: utilities */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
          }
          @page {
            margin: 0.5in;
          }
          aside, header, nav {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
