import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { fetchApi } from '../../api/client';

export default function BulkMenuUploadModal({ isOpen, onClose, onSuccess }) {
  const [parsedItems, setParsedItems] = useState([]);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDownloadSampleCSV = () => {
    const csvContent = `name,price,category,description,imageUrl\nButter Chicken (Murgh Makhani),320.00,Main,Tender tandoori chicken cooked in rich butter tomato gravy,https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80\nGarlic Naan,60.00,Sides,Fresh tandoor baked bread with garlic butter,https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80\nMango Lassi,90.00,Beverages,Traditional chilled mango yogurt drink,https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_menu_import.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVText = (text) => {
    setErrorMsg('');
    try {
      const lines = text.trim().split('\n').filter(Boolean);
      if (lines.length <= 1) {
        setErrorMsg('File contains no data rows');
        return [];
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const items = [];

      for (let i = 1; i < lines.length; i++) {
        // Simple CSV splitter respecting quotes if any
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"(.*)"$/, '$1'));
        if (cols.length < 2) continue;

        const item = {
          name: cols[0] || 'Imported Dish',
          price: parseFloat(cols[1]) || 0,
          category: cols[2] || 'Main',
          description: cols[3] || '',
          imageUrl: cols[4] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
          isAvailable: true
        };

        if (item.name && !isNaN(item.price)) {
          items.push(item);
        }
      }

      return items;
    } catch (err) {
      setErrorMsg('Error parsing CSV file format: ' + err.message);
      return [];
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setRawText(content);
      const items = parseCSVText(content);
      setParsedItems(items);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setRawText(val);
    const items = parseCSVText(val);
    setParsedItems(items);
  };

  const handleImportSubmit = async () => {
    if (parsedItems.length === 0) {
      alert('No valid items to import');
      return;
    }

    try {
      setLoading(true);
      const res = await fetchApi('/vendor/menu/bulk-upload', {
        method: 'POST',
        body: JSON.stringify({ items: parsedItems })
      });

      alert(`✅ ${res.message}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to import menu items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto p-6 shadow-2xl border border-gray-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Bulk Menu Upload Importer</h3>
              <p className="text-xs font-semibold text-gray-400">Import entire food catalog from CSV or JSON file</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sample Template Download */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-gray-900">Need a CSV template format?</div>
              <div className="text-[11px] text-gray-500 font-semibold">Download our sample CSV file with correct headers</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadSampleCSV}
            className="px-3.5 py-2 bg-white text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-300 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Download Sample CSV
          </button>
        </div>

        {/* File Upload / Paste Area */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            1. Select CSV or JSON File
          </label>

          <label className="border-2 border-dashed border-gray-300 hover:border-rose-500 bg-gray-50 hover:bg-rose-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
            <Upload className="w-8 h-8 text-rose-500 mb-2" />
            <span className="text-xs font-extrabold text-gray-800">
              {fileName ? `File: ${fileName}` : 'Click to upload CSV or JSON file'}
            </span>
            <span className="text-[11px] text-gray-400 font-semibold mt-0.5">Supports .csv, .txt, or .json</span>
            <input
              type="file"
              accept=".csv,.json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute">Or Paste CSV Text Below</span>
          </div>

          <textarea
            rows="3"
            placeholder={`name,price,category,description,imageUrl\nMargherita Pizza,16.50,Pizza,Fresh basil and mozzarella\nGarlic Knots,5.00,Sides,Warm herb knots`}
            value={rawText}
            onChange={handleTextChange}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
          ></textarea>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preview Parsed Items Table */}
        {parsedItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Preview Parsed Menu Items ({parsedItems.length} items ready)</span>
              <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Ready for Import
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100 text-xs">
              {parsedItems.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-gray-900">{item.name}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full ml-2 font-bold">{item.category}</span>
                    <p className="text-[11px] text-gray-400 truncate max-w-xs">{item.description}</p>
                  </div>
                  <span className="font-black text-rose-600">₹{item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={loading || parsedItems.length === 0}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Importing Menu...' : `Import ${parsedItems.length} Dishes Now`}
          </button>
        </div>
      </div>
    </div>
  );
}
