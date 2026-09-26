import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter, X, FileSpreadsheet, Check } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function ReportDownloaderModal({ isOpen, onClose, restaurants = [] }) {
  const [datePreset, setDatePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('ALL');
  const [format, setFormat] = useState('csv');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(formatDate(today));
      setEndDate(formatDate(today));
    } else if (preset === '7days') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (preset === '30days') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (preset === 'all') {
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
      if (selectedRestaurant) params.append('restaurantId', selectedRestaurant);
      params.append('format', format);

      const endpoint = `/admin/reports/export?${params.toString()}`;
      
      // Fetch report blob with Bearer token authentication
      const blob = await fetchApi(endpoint, { responseType: 'blob' });
      
      const fileName = `sales_report_${format}_${Date.now()}.${format}`;
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Universal download trigger compatible with Mobile WebViews, APKs, and Brave
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Fallback open window for APK WebViews if direct download is intercepted
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
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Automated Report Generator</h3>
              <p className="text-xs font-semibold text-gray-400">Export granular sales and order analytics</p>
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
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Date Range Filter
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '30days', label: 'Last 30 Days' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                    datePreset === p.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('custom');
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Restaurant Select Dropdown */}
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
              {restaurants.map((r) => (
                <option key={r.restaurantId} value={r.restaurantId}>
                  🏬 {r.restaurantName} ({r.cuisine})
                </option>
              ))}
            </select>
          </div>

          {/* Export Format (CSV vs PDF) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Export Format
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
                  <div className="text-[10px] font-semibold text-gray-400">Excel / Raw Order Logs</div>
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
                  <div className="text-[10px] font-semibold text-gray-400">Executive Printable Document</div>
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
            {downloading ? 'Generating Report...' : `Download ${format.toUpperCase()} Report`}
          </button>
        </div>

      </div>
    </div>
  );
}
