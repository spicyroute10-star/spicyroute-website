import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter, X, FileSpreadsheet, Store, Clock } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function ReportDownloaderModal({
  isOpen,
  onClose,
  restaurants = [],
  isVendor = false,
  restaurantName = ''
}) {
  const [datePreset, setDatePreset] = useState('today');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('ALL');
  const [format, setFormat] = useState('csv');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const formatDate = (d) => d.toISOString().split('T')[0];

  const handlePresetSelect = (preset) => {
    setDatePreset(preset);
    const today = new Date();

    if (preset === 'today') {
      // Day-wise: Today
      setStartDate(formatDate(today));
      setEndDate(formatDate(today));
    } else if (preset === 'yesterday') {
      // Day-wise: Yesterday
      const yest = new Date();
      yest.setDate(today.getDate() - 1);
      setStartDate(formatDate(yest));
      setEndDate(formatDate(yest));
    } else if (preset === 'weekly') {
      // Weekly: Last 7 Days
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (preset === 'monthly') {
      // Monthly: Last 30 Days
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (preset === 'all') {
      // Lifetime / All Time
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (!isVendor && selectedRestaurant) {
        params.append('restaurantId', selectedRestaurant);
      }
      params.append('format', format);

      const endpoint = isVendor 
        ? `/vendor/reports/export?${params.toString()}` 
        : `/admin/reports/export?${params.toString()}`;

      // Fetch report blob with Bearer token authentication
      const blob = await fetchApi(endpoint, { responseType: 'blob' });
      
      const safePrefix = isVendor 
        ? (restaurantName ? restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'vendor')
        : 'spicyroute_admin';
      const fileName = `${safePrefix}_${datePreset}_report_${Date.now()}.${format}`;
      const blobUrl = window.URL.createObjectURL(blob);

      // Universal download trigger compatible with Mobile WebViews, APKs, and Brave
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup blob reference
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 15000);

      setDownloading(false);
      onClose();
    } catch (err) {
      alert('Error downloading report: ' + err.message);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
              isVendor ? 'bg-gradient-to-br from-amber-500 to-rose-600 shadow-amber-500/20' : 'bg-gradient-to-br from-rose-600 to-slate-900 shadow-rose-600/20'
            }`}>
              {isVendor ? <Store className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900">
                {isVendor ? 'Restaurant Earnings & Order Reports' : 'Super Admin Executive Report Generator'}
              </h3>
              <p className="text-xs font-semibold text-gray-400">
                {isVendor 
                  ? `Download Day-wise, Weekly, or Monthly sales for ${restaurantName || 'your restaurant'}` 
                  : 'Export granular platform GMV, commissions, and restaurant logs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 space-y-5">
          {/* Preset Date Ranges */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Select Time Window
              </label>
              <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {datePreset === 'today' && 'Today Only'}
                {datePreset === 'yesterday' && 'Yesterday Only'}
                {datePreset === 'weekly' && 'Last 7 Days'}
                {datePreset === 'monthly' && 'Last 30 Days'}
                {datePreset === 'all' && 'Entire History'}
                {datePreset === 'custom' && 'Custom Date Range'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'today', label: '⚡ Day-Wise (Today)', desc: 'Single day sales' },
                { id: 'yesterday', label: '⏮️ Yesterday', desc: 'Previous day' },
                { id: 'weekly', label: '📆 Weekly (7 Days)', desc: 'Last 7 days' },
                { id: 'monthly', label: '🗓️ Monthly (30 Days)', desc: 'Full month' },
                { id: 'all', label: '🌐 All Time', desc: 'Lifetime logs' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id)}
                  className={`p-2.5 rounded-xl text-left transition-all border ${
                    datePreset === p.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xs font-extrabold leading-tight">{p.label}</div>
                  <div className={`text-[10px] font-medium mt-0.5 ${datePreset === p.id ? 'text-rose-100' : 'text-gray-400'}`}>
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase">Selected Dates (Adjust Anytime)</span>
              {datePreset === 'custom' && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Custom Active
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">From (Start Date)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">To (End Date)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Restaurant Select Dropdown (Super Admin Only) */}
          {!isVendor && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Restaurant Granularity
              </label>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="ALL">🌐 All Restaurants (Platform Global)</option>
                {(Array.isArray(restaurants) ? restaurants : []).map((r, idx) => (
                  <option key={r?.restaurantId || r?.id || idx} value={r?.restaurantId || r?.id}>
                    🏬 {r?.restaurantName || 'Unnamed'} ({r?.cuisine || 'General'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Export Format (CSV vs PDF) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  format === 'csv'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">CSV Spreadsheet</div>
                  <div className="text-[10px] font-semibold text-gray-400">Excel / Full Order Breakdown</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  format === 'pdf'
                    ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Styled PDF Report</div>
                  <div className="text-[10px] font-semibold text-gray-400">Printable Executive Summary</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Preparing File...' : `Download ${format.toUpperCase()} (${datePreset.toUpperCase()})`}
          </button>
        </div>

      </div>
    </div>
  );
}
