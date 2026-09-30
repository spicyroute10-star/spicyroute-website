import React, { useState } from 'react';
import { 
  Upload, Camera, FileSpreadsheet, Download, X, CheckCircle, 
  AlertCircle, Trash2, Plus, Loader2, Image as ImageIcon, Sparkles, RefreshCw
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { fetchApi } from '../../api/client';

// Category stock images for realistic storefront cards
const CATEGORY_IMAGES = {
  Biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
  Burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
  Starters: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
  Main: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
  Breads: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  Snacks: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80',
  Beverages: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
  Desserts: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80'
};

const CATEGORIES = [
  'Main', 'Starters', 'Biryani', 'Pizza', 'Burgers', 
  'Snacks', 'Breads', 'Beverages', 'Desserts'
];

function guessCategory(name, currentSection = 'Main') {
  const lower = name.toLowerCase();
  if (/biryani|pulao|rice/i.test(lower)) return 'Biryani';
  if (/pizza/i.test(lower)) return 'Pizza';
  if (/burger/i.test(lower)) return 'Burgers';
  if (/naan|roti|kulcha|paratha|bread/i.test(lower)) return 'Breads';
  if (/tikka|kebab|fry|wings|starter|chilli|manchurian/i.test(lower)) return 'Starters';
  if (/shake|lassi|juice|coffee|tea|soda|mojito|coke|beverage|drink/i.test(lower)) return 'Beverages';
  if (/ice cream|halwa|jamun|cake|brownie|dessert|sweet/i.test(lower)) return 'Desserts';
  if (/fries|roll|samosa|momos|chips|snack/i.test(lower)) return 'Snacks';
  return currentSection;
}

export default function BulkMenuUploadModal({ isOpen, onClose, onSuccess }) {
  const [tab, setTab] = useState('photo'); // 'photo' | 'csv'
  const [parsedItems, setParsedItems] = useState([]);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  if (!isOpen) return null;

  // Smart parser to extract dishes & prices from OCR text
  const parseMenuCardText = (text) => {
    setErrorMsg('');
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];
    let currentCategory = 'Main';

    for (const rawLine of lines) {
      // Filter out common menu headers, phone numbers, noise
      if (/^(menu|food menu|restaurant|welcome|contact|phone|tel|gst|page\s*\d+)/i.test(rawLine)) {
        continue;
      }

      // Check if line is a category heading
      const cleanUpper = rawLine.toUpperCase();
      if (/^(STARTERS|APPETIZERS|SOUPS)/i.test(cleanUpper)) {
        currentCategory = 'Starters';
        continue;
      }
      if (/^(MAIN COURSE|CURRIES|GRAVY)/i.test(cleanUpper)) {
        currentCategory = 'Main';
        continue;
      }
      if (/^(BIRYANI|RICE)/i.test(cleanUpper)) {
        currentCategory = 'Biryani';
        continue;
      }
      if (/^(PIZZA|PIZZAS)/i.test(cleanUpper)) {
        currentCategory = 'Pizza';
        continue;
      }
      if (/^(BURGERS|BURGER|SANDWICH)/i.test(cleanUpper)) {
        currentCategory = 'Burgers';
        continue;
      }
      if (/^(BREADS|ROTI|NAAN)/i.test(cleanUpper)) {
        currentCategory = 'Breads';
        continue;
      }
      if (/^(BEVERAGES|DRINKS|SHAKES|COLD DRINKS)/i.test(cleanUpper)) {
        currentCategory = 'Beverages';
        continue;
      }
      if (/^(DESSERTS|SWEETS|ICE CREAM)/i.test(cleanUpper)) {
        currentCategory = 'Desserts';
        continue;
      }
      if (/^(SNACKS|FAST FOOD|CHIPS)/i.test(cleanUpper)) {
        currentCategory = 'Snacks';
        continue;
      }

      // Look for price pattern (e.g. ₹250, Rs. 180, 150/-, $12.50, or just trailing numbers 240)
      const priceRegex = /(?:₹|Rs\.?|INR|\$)?\s*(\d{2,5}(?:\.\d{1,2})?)\s*(?:\/-)?\s*$/i;
      const match = rawLine.match(priceRegex);

      if (match) {
        const price = parseFloat(match[1]);
        let name = rawLine.replace(match[0], '').replace(/[.\-_:~|•\t]+$/g, '').trim();

        // Clean leading bullets or numbers
        name = name.replace(/^[\d.)\s•\-]+/, '').trim();

        if (name.length >= 2 && !isNaN(price) && price > 0 && price < 50000) {
          const category = guessCategory(name, currentCategory);
          items.push({
            name,
            price,
            category,
            description: `Freshly prepared ${name}`,
            imageUrl: CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Main,
            isAvailable: true
          });
        }
      }
    }

    return items;
  };

  // Handle Photo Upload & OCR Processing
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg('');
    setFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
    setScanning(true);
    setScanProgress(0);

    try {
      // OCR processing using Tesseract.js WebAssembly
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.round((m.progress || 0) * 100));
          }
        }
      });

      const extracted = result.data.text || '';
      setRawText(extracted);

      const dishes = parseMenuCardText(extracted);
      if (dishes.length === 0) {
        setErrorMsg('Could not detect distinct dishes and prices from this photo. You can manually paste or review the extracted text below.');
        setShowRawText(true);
      } else {
        setParsedItems(dishes);
      }
    } catch (err) {
      console.error('Menu card OCR failed:', err);
      setErrorMsg('Failed to read text from menu card image: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  // CSV Template download
  const handleDownloadSampleCSV = () => {
    const csvContent = `name,price,category,description,imageUrl\nButter Chicken,320.00,Main,Tender tandoori chicken cooked in rich butter tomato gravy,${CATEGORY_IMAGES.Main}\nGarlic Naan,60.00,Breads,Fresh tandoor baked bread with garlic butter,${CATEGORY_IMAGES.Breads}\nMango Lassi,90.00,Beverages,Traditional chilled mango yogurt drink,${CATEGORY_IMAGES.Beverages}\nChicken Biryani,280.00,Biryani,Fragrant basmati rice with spiced chicken,${CATEGORY_IMAGES.Biryani}`;

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
      if (lines.length <= 1) return [];

      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"(.*)"$/, '$1'));
        if (cols.length < 2) continue;

        const name = cols[0] || 'Dish';
        const price = parseFloat(cols[1]) || 0;
        const category = cols[2] || guessCategory(name, 'Main');

        if (name && !isNaN(price)) {
          items.push({
            name,
            price,
            category,
            description: cols[3] || `Freshly prepared ${name}`,
            imageUrl: cols[4] || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Main,
            isAvailable: true
          });
        }
      }
      return items;
    } catch (err) {
      setErrorMsg('Error parsing CSV file: ' + err.message);
      return [];
    }
  };

  const handleCSVFileUpload = (e) => {
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

  const handleUpdateItem = (index, field, value) => {
    setParsedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'category') {
        updated[index].imageUrl = CATEGORY_IMAGES[value] || CATEGORY_IMAGES.Main;
      }
      return updated;
    });
  };

  const handleDeleteItem = (index) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddManualItem = () => {
    setParsedItems(prev => [
      ...prev,
      {
        name: 'New Dish',
        price: 150,
        category: 'Main',
        description: 'Chef special dish',
        imageUrl: CATEGORY_IMAGES.Main,
        isAvailable: true
      }
    ]);
  };

  const handleImportSubmit = async () => {
    if (parsedItems.length === 0) {
      alert('Please scan a menu photo or upload a file with dishes first.');
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
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Menu Card Photo & Bulk Importer</h3>
              <p className="text-xs font-semibold text-gray-400">
                Snap or upload a photo of your printed menu card to automatically extract dishes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Photo Card vs CSV */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => setTab('photo')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all ${
              tab === 'photo' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>📸 Scan Menu Card Photo (OCR)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('csv')}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all ${
              tab === 'csv' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📄 CSV / Excel Spreadsheet</span>
          </button>
        </div>

        {/* PHOTO OCR UPLOAD VIEW */}
        {tab === 'photo' && (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50/70 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
              <div className="w-14 h-14 rounded-2xl bg-white text-rose-600 flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-sm font-black text-gray-900">
                {fileName ? `Selected: ${fileName}` : 'Click to Upload Menu Card Photo'}
              </span>
              <span className="text-xs text-rose-600 font-bold mt-1">
                Supports camera snapshot, JPG, PNG, WEBP of physical restaurant menu
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={scanning}
              />
            </label>

            {/* OCR Processing Progress Bar */}
            {scanning && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    Reading dishes & prices with AI OCR...
                  </span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(scanProgress, 10)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Image Preview & Raw Text Toggle */}
            {imagePreview && !scanning && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs">
                <div className="flex items-center gap-3">
                  <img src={imagePreview} alt="Menu Card" className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-xs" />
                  <div>
                    <span className="font-extrabold text-gray-900 block truncate max-w-xs">{fileName}</span>
                    <span className="text-[11px] text-emerald-600 font-bold">✓ Scanned successfully</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRawText(!showRawText)}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl font-bold text-[11px] transition-colors"
                >
                  {showRawText ? 'Hide Raw OCR Text' : 'View Raw OCR Text'}
                </button>
              </div>
            )}

            {showRawText && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                  Extracted Text (You can edit text and click "Re-parse Dishes"):
                </label>
                <textarea
                  rows="4"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                ></textarea>
                <button
                  type="button"
                  onClick={() => setParsedItems(parseMenuCardText(rawText))}
                  className="mt-1.5 px-3 py-1 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black"
                >
                  Re-parse Dishes from Text
                </button>
              </div>
            )}
          </div>
        )}

        {/* CSV SPREADSHEET VIEW */}
        {tab === 'csv' && (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-rose-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Need a CSV template format?</div>
                  <div className="text-[11px] text-gray-500 font-semibold">Download sample CSV with name, price, category headers</div>
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

            <label className="border-2 border-dashed border-gray-300 hover:border-rose-500 bg-gray-50 hover:bg-rose-50/30 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <Upload className="w-7 h-7 text-rose-500 mb-1" />
              <span className="text-xs font-extrabold text-gray-800">
                {fileName ? `File: ${fileName}` : 'Click to upload CSV or JSON file'}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Supports .csv, .txt, or .json</span>
              <input
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleCSVFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Extracted Dishes Preview & Live Editor */}
        {parsedItems.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-black text-gray-900">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Extracted Dishes ({parsedItems.length} items ready)</span>
              </div>
              <button
                type="button"
                onClick={handleAddManualItem}
                className="text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-1 text-[11px] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100 text-xs bg-white shadow-xs">
              {parsedItems.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center gap-2.5 hover:bg-gray-50/80 transition-colors">
                  {/* Category Thumbnail */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                  />

                  {/* Name Input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      className="w-full px-2 py-1 font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-rose-500 focus:outline-none text-xs"
                      placeholder="Dish Name"
                    />
                  </div>

                  {/* Category Select */}
                  <select
                    value={item.category}
                    onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                    className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Price Input */}
                  <div className="flex items-center gap-1 w-20 flex-shrink-0">
                    <span className="font-extrabold text-gray-400 text-xs">₹</span>
                    <input
                      type="number"
                      step="1"
                      value={item.price}
                      onChange={(e) => handleUpdateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-1.5 py-1 font-black text-rose-600 text-center bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(idx)}
                    className="p-1 text-gray-300 hover:text-rose-600 rounded-lg transition-colors flex-shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={loading || parsedItems.length === 0}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Importing Menu...' : `Import ${parsedItems.length} Dishes to Catalog`}
          </button>
        </div>

      </div>
    </div>
  );
}
