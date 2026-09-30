import React, { useState } from 'react';
import { 
  Upload, Camera, FileSpreadsheet, Download, X, CheckCircle, 
  AlertCircle, Trash2, Plus, Loader2, Image as ImageIcon, Sparkles, RefreshCw, Layers, Edit3, Wand2, Search
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { fetchApi } from '../../api/client';

// Category stock images for realistic storefront cards
const CATEGORY_IMAGES = {
  Biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
  Tiffins: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
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
  'Tiffins', 'Main', 'Starters', 'Biryani', 'Pizza', 'Burgers', 
  'Snacks', 'Breads', 'Beverages', 'Desserts'
];

function guessCategory(name, currentSection = 'Main') {
  const lower = name.toLowerCase();
  if (/dosa|dosal|idli|idly|vada|wada|puri|poori|upma|uttapam|pesara|pesarattu|parotta|tiffin|bhature|chole|poha|bonda|sambhar|karam/i.test(lower)) return 'Tiffins';
  if (/biryani|pulao|rice|fried\s*rice/i.test(lower)) return 'Biryani';
  if (/pizza/i.test(lower)) return 'Pizza';
  if (/burger|sandwich/i.test(lower)) return 'Burgers';
  if (/naan|roti|kulcha|paratha|bread|chapati/i.test(lower)) return 'Breads';
  if (/tikka|kebab|fry|wings|starter|chilli|manchurian|65|lollipop|crispy|soup/i.test(lower)) return 'Starters';
  if (/shake|lassi|juice|coffee|tea|soda|mojito|coke|beverage|drink|water|cooler/i.test(lower)) return 'Beverages';
  if (/ice\s*cream|halwa|jamun|cake|brownie|dessert|sweet|kheer|rasgulla/i.test(lower)) return 'Desserts';
  if (/fries|roll|samosa|momos|chips|snack|pakoda|chaat|maggi/i.test(lower)) return 'Snacks';
  return currentSection;
}

// Canvas-based image preprocessor: sharpens phone photos & increases contrast for high OCR accuracy
function preprocessImage(file) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) return resolve(file);

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        // Resize if too huge or too small for optimal Tesseract performance
        const maxDim = Math.max(img.width, img.height);
        const scale = Math.max(1, Math.min(2.5, 2200 / maxDim));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        // Grayscale conversion and high-contrast thresholding
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          // S-curve contrast enhancement to separate dark ink from paper
          const enhanced = gray < 135 
            ? (gray * gray) / 135 
            : Math.min(255, 135 + (gray - 135) * 1.4);
          d[i] = enhanced;
          d[i + 1] = enhanced;
          d[i + 2] = enhanced;
        }
        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', 0.95);
      } catch (err) {
        resolve(file);
      }
    };
    img.onerror = () => resolve(file);
    img.src = url;
  });
}

export default function BulkMenuUploadModal({ isOpen, onClose, onSuccess }) {
  const [tab, setTab] = useState('photo'); // 'photo' | 'editor' | 'csv'
  const [parsedItems, setParsedItems] = useState([]);
  const [rawText, setRawText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanningPageText, setScanningPageText] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]); // array of { file, preview, name, id }
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Smart parser to extract dishes & prices from OCR text
  const parseMenuCardText = (text) => {
    setErrorMsg('');
    if (!text) return [];

    // Clean non-printable / binary characters
    const clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFD]/g, '');
    const rawLines = clean.split('\n').map(l => l.trim()).filter(Boolean);
    const items = [];
    let currentCategory = /(break\s*fast|tiffin|dosa|idli|idly|vada)/i.test(clean) ? 'Tiffins' : 'Main';

    // Helper to check if a string is a category header
    const detectCategoryHeader = (line) => {
      const u = line.toUpperCase();
      if (/^(TIFFINS?|BREAK\s*FAST|SOUTH\s*INDIAN|DOSAS?|IDLIS?|IDLYS?|MORNING)/i.test(u)) return 'Tiffins';
      if (/^(STARTERS?|APPETIZERS?|SOUPS?|TANDOOR)/i.test(u)) return 'Starters';
      if (/^(MAIN\s*COURSE|CURRIES|GRAVY|SPECIALS?|VEG\s*CURRIES|CHICKEN\s*CURRIES)/i.test(u)) return 'Main';
      if (/^(BIRYANI|RICE|PULAO|FRIED\s*RICE)/i.test(u)) return 'Biryani';
      if (/^(PIZZAS?)/i.test(u)) return 'Pizza';
      if (/^(BURGERS?|SANDWICH(?:ES)?)/i.test(u)) return 'Burgers';
      if (/^(BREADS?|ROTIS?|NAANS?|PARATHAS?)/i.test(u)) return 'Breads';
      if (/^(BEVERAGES?|DRINKS?|SHAKES?|JUICES?|HOT\s*&\s*COLD|COOL\s*DRINKS?|TEA|COFFEE)/i.test(u)) return 'Beverages';
      if (/^(DESSERTS?|SWEETS?|ICE\s*CREAMS?)/i.test(u)) return 'Desserts';
      if (/^(SNACKS?|FAST\s*FOOD|CHAAT|NOODLES|MOMOS?)/i.test(u)) return 'Snacks';
      return null;
    };

    const isPurePrice = (str) => {
      return /^(?:₹|Rs\.?|INR|\$)?\s*\d{2,5}(?:\.\d{1,2})?\s*(?:\/-)?$/i.test(str.trim());
    };

    const cleanDishName = (str) => {
      let cleaned = str
        .replace(/^[\d.)\s•\-:–—]+/, '') // Remove leading numbers like "1.", "02)"
        .replace(/[.\-_:~|•\t+=—–]+$/g, '') // Remove trailing dots or dashes
        .replace(/^(HALF|FULL|REGULAR|LARGE|SMALL)\b\s*/i, '')
        .trim();

      // Clean up common South Indian menu OCR patterns:
      cleaned = cleaned.replace(/\bIdly\s*(\d)\b/i, 'Idly ($1 Pcs)');
      cleaned = cleaned.replace(/\bIdli\s*(\d)\b/i, 'Idli ($1 Pcs)');
      cleaned = cleaned.replace(/\bPoori\s*\(?(\d)\)?/i, 'Poori ($1 Pcs)');
      cleaned = cleaned.replace(/\bEgg\s*Dosa[l]?\s*\(?\s*(\d)\s*Eggs?\)?/i, 'Egg Dosa ($1 Egg)');
      cleaned = cleaned.replace(/\bDosal\b/i, 'Dosa');

      return cleaned.trim();
    };

    // First pass: combine line i (dish name) with line i+1 (if line i+1 is strictly a price)
    const combinedLines = [];
    for (let i = 0; i < rawLines.length; i++) {
      let current = rawLines[i];
      const next = rawLines[i + 1];

      // Fix OCR numbers: replace capital O with 0 if surrounded by digits (e.g. 18O -> 180, 2OO -> 200)
      current = current.replace(/(\d)[Oo]/g, '$10').replace(/[Oo](\d)/g, '0$1');

      if (/^(menu|food menu|restaurant|welcome|contact|phone|tel|gst|page\s*\d+|price|rate|items?|sr\s*no|half\s*full)/i.test(current)) {
        continue;
      }

      const catHeader = detectCategoryHeader(current);
      if (catHeader) {
        combinedLines.push({ type: 'header', category: catHeader });
        continue;
      }

      // If current line has letters and no price digits, but next line is JUST a price, merge them!
      if (!/\d{2,5}/.test(current) && next && isPurePrice(next)) {
        combinedLines.push({ type: 'item', line: `${current} ${next}` });
        i++; // skip next line because it's merged
        continue;
      }

      combinedLines.push({ type: 'item', line: current });
    }

    // Second pass: Parse items from combined lines
    for (const entry of combinedLines) {
      if (entry.type === 'header') {
        currentCategory = entry.category;
        continue;
      }

      const line = entry.line;

      // Check if line contains TWO prices (Half and Full, e.g. "Chicken Biryani 140 240" or "Chicken Biryani 140 / 240")
      const multiPriceMatch = line.match(/^(.+?)\s+(\d{2,4})\s*(?:\/|\s+)\s*(\d{2,4})\s*$/);
      if (multiPriceMatch) {
        const dishBase = cleanDishName(multiPriceMatch[1]);
        const halfPrice = parseFloat(multiPriceMatch[2]);
        const fullPrice = parseFloat(multiPriceMatch[3]);
        if (dishBase.length >= 2 && /[a-zA-Z]/.test(dishBase)) {
          const category = guessCategory(dishBase, currentCategory);
          items.push({
            name: `${dishBase} (Half)`,
            price: halfPrice,
            category,
            description: `Freshly prepared half portion of ${dishBase}`,
            imageUrl: CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Main,
            isAvailable: true
          });
          items.push({
            name: `${dishBase} (Full)`,
            price: fullPrice,
            category,
            description: `Freshly prepared full portion of ${dishBase}`,
            imageUrl: CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Main,
            isAvailable: true
          });
          continue;
        }
      }

      // Check if line contains multiple dishes side-by-side (e.g. "Tea 15 Coffee 25" or "Veg Fried Rice 120 Egg Fried Rice 140")
      const segmentRegex = /([A-Za-z\s()&'-]+?)\s*(?:₹|Rs\.?|INR|\$)?\s*(\d{2,5}(?:\.\d{1,2})?)\s*(?:\/-)?(?=\s+[A-Za-z]|$)/g;
      let segMatch;
      let matchedSegments = [];
      while ((segMatch = segmentRegex.exec(line)) !== null) {
        const segName = cleanDishName(segMatch[1]);
        const segPrice = parseFloat(segMatch[2]);
        if (segName.length >= 2 && /[a-zA-Z]/.test(segName) && segPrice > 0 && segPrice < 50000) {
          matchedSegments.push({ name: segName, price: segPrice });
        }
      }

      if (matchedSegments.length > 1) {
        for (const seg of matchedSegments) {
          const category = guessCategory(seg.name, currentCategory);
          items.push({
            name: seg.name,
            price: seg.price,
            category,
            description: `Freshly prepared ${seg.name}`,
            imageUrl: CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Main,
            isAvailable: true
          });
        }
        continue;
      }

      // Standard single dish line:
      const trailingMatch = line.match(/(?:₹|Rs\.?|INR|\$)?\s*(\d{2,5}(?:\.\d{1,2})?)\s*(?:\/-)?\s*$/i);
      const leadingMatch = line.match(/^(?:₹|Rs\.?|INR|\$)?\s*(\d{2,5}(?:\.\d{1,2})?)\s*(?:\/-)?\s*[:\-\s]\s*(.+)$/i);
      const middleMatch = line.match(/[:\-—|]\s*(?:₹|Rs\.?|INR|\$)?\s*(\d{2,5}(?:\.\d{1,2})?)\s*(?:\/-)?\s*$/i);

      let name = '';
      let price = 0;

      if (trailingMatch && trailingMatch.index > 2) {
        price = parseFloat(trailingMatch[1]);
        name = line.slice(0, trailingMatch.index);
      } else if (middleMatch) {
        price = parseFloat(middleMatch[1]);
        name = line.slice(0, middleMatch.index);
      } else if (leadingMatch) {
        price = parseFloat(leadingMatch[1]);
        name = leadingMatch[2];
      }

      name = cleanDishName(name);

      if (name.length >= 2 && /[a-zA-Z]/.test(name) && !isNaN(price) && price > 0 && price < 50000) {
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

    return items;
  };

  // Handle Multi-Photo Upload & Sequential OCR Processing
  const handleMultiplePhotosUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMsg('');
    setScanning(true);

    const newPhotoObjs = files.map((file, idx) => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${idx}`
    }));

    const allPhotos = [...uploadedPhotos, ...newPhotoObjs];
    setUploadedPhotos(allPhotos);

    let accumulatedText = rawText;
    const allDishes = [...parsedItems];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const pageIndex = uploadedPhotos.length + i + 1;
      setScanningPageText(`Preprocessing & Scanning Page ${pageIndex} of ${allPhotos.length}: ${file.name}...`);
      setScanProgress(5);

      try {
        // High-contrast preprocess to optimize for camera phone captures
        const enhancedBlob = await preprocessImage(file);
        setScanProgress(15);

        const result = await Tesseract.recognize(enhancedBlob, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setScanProgress(15 + Math.round((m.progress || 0) * 85));
            }
          }
        });

        const extracted = result.data.text || '';
        accumulatedText += (accumulatedText ? '\n\n' : '') + `--- PAGE ${pageIndex} (${file.name}) ---\n` + extracted;
        
        const newDishes = parseMenuCardText(extracted);
        // Avoid duplicate items by lowercase name
        for (const dish of newDishes) {
          const exists = allDishes.some(d => d.name.toLowerCase() === dish.name.toLowerCase() && d.price === dish.price);
          if (!exists) {
            allDishes.push(dish);
          }
        }
      } catch (err) {
        console.error(`OCR failed for ${file.name}:`, err);
        setErrorMsg(`Failed scanning ${file.name}: ${err.message}`);
      }
    }

    setRawText(accumulatedText);
    setParsedItems(allDishes);
    setScanning(false);
    setScanningPageText('');

    if (allDishes.length === 0) {
      setErrorMsg('Could not detect distinct dishes from the photo. Click "✏️ View & Edit OCR Text" below to review or format the scanned text.');
      setTab('editor');
    }
  };

  const handleRemovePhoto = (id) => {
    setUploadedPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Auto Clean OCR Text
  const handleAutoCleanText = () => {
    let cleaned = rawText
      .replace(/[•·—–_]{2,}/g, ' ') // remove dot-leaders like ........
      .replace(/[|\\]/g, ' ') // remove pipe/backslash separators
      .replace(/\s{2,}/g, ' ') // collapse multi-spaces
      .replace(/(\d+)\s*\/\s*-\s*/g, '$1 ') // clean 180/- to 180
      .replace(/Rs\.?\s*/gi, '₹'); // normalize Rs. to ₹

    setRawText(cleaned);
    const updatedDishes = parseMenuCardText(cleaned);
    setParsedItems(updatedDishes);
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
    if (text.includes('JFIF') || text.includes('Exif') || /[\x00-\x08\x0E-\x1F]/.test(text.slice(0, 200))) {
      setErrorMsg('This file is an image (JPG/PNG), not a CSV. Please use the "Upload Menu Photos" tab to scan it with AI OCR.');
      return [];
    }

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
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif|tiff)$/i.test(file.name)) {
      setTab('photo');
      handleMultiplePhotosUpload(e);
      return;
    }

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
        name: 'New Special Dish',
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

  const filteredItems = parsedItems.filter(item => 
    item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto p-5 sm:p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">Multi-Page Menu Card Scanner</h3>
              <p className="text-xs font-semibold text-gray-400">
                Upload JPG/PNG menu photos to extract dishes and prices automatically
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Photos vs Text Editor vs CSV */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => setTab('photo')}
            className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              tab === 'photo' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📸 Scan Photos ({uploadedPhotos.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('editor')}
            className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              tab === 'editor' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>✏️ Edit OCR Text</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('csv')}
            className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              tab === 'csv' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>📄 CSV</span>
          </button>
        </div>

        {/* TAB 1: PHOTO OCR SCANNER */}
        {tab === 'photo' && (
          <div className="space-y-3">
            <label className="border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50/70 rounded-3xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
              <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-sm font-black text-gray-900">
                {uploadedPhotos.length > 0 ? '+ Click to Add More Menu Card Photos' : 'Click to Upload Menu Card Photos (JPG / PNG)'}
              </span>
              <span className="text-xs text-rose-600 font-bold mt-0.5">
                You can select multiple JPG images at once (Page 1, Page 2, Front & Back)
              </span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Supports .jpg, .jpeg, .png, .webp
              </span>
              <input
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp"
                multiple
                onChange={handleMultiplePhotosUpload}
                className="hidden"
                disabled={scanning}
              />
            </label>

            {/* Live Scanning Progress */}
            {scanning && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    {scanningPageText || 'Scanning menu photo with AI OCR...'}
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

            {/* Thumbnail Gallery */}
            {uploadedPhotos.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-rose-600" />
                    Uploaded Menu Pages ({uploadedPhotos.length} photos)
                  </span>
                  <label className="text-rose-600 hover:text-rose-700 font-bold cursor-pointer text-[11px] underline">
                    + Add More Photos
                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp"
                      multiple
                      onChange={handleMultiplePhotosUpload}
                      className="hidden"
                      disabled={scanning}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                  {uploadedPhotos.map((photo, pIdx) => (
                    <div key={photo.id || pIdx} className="relative flex-shrink-0 group w-18 h-22 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-xs">
                      <img src={photo.preview} alt={`Page ${pIdx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-between p-1">
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="self-end p-0.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                          title="Remove photo"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-[9px] font-black text-white text-center">
                          Page {pIdx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OCR TEXT EDITOR & AUTO-CLEAN */}
        {tab === 'editor' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                Raw OCR Text (Edit or paste menu text here):
              </span>
              <button
                type="button"
                onClick={handleAutoCleanText}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition-all"
                title="Fixes OCR dots, dashes, and currency formatting automatically"
              >
                <Wand2 className="w-3 h-3 text-amber-600" />
                Auto-Clean OCR Text
              </button>
            </div>

            <textarea
              rows="6"
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setParsedItems(parseMenuCardText(e.target.value));
              }}
              placeholder={`Paste or edit your menu text here. Example format:\nButter Chicken 280\nPaneer Tikka 160\nChicken Biryani 240\nGarlic Naan 50`}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
            ></textarea>

            <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold px-1">
              <span>💡 Format: <strong>Dish Name Price</strong> (e.g. <code>Butter Chicken 280</code>)</span>
              <button
                type="button"
                onClick={() => setParsedItems(parseMenuCardText(rawText))}
                className="px-3 py-1 bg-gray-900 text-white rounded-lg font-bold text-[11px] hover:bg-black transition-colors"
              >
                Re-Parse List
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CSV SPREADSHEET */}
        {tab === 'csv' && (
          <div className="space-y-3">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-gray-900">Need a CSV template?</div>
                  <div className="text-[11px] text-gray-500 font-semibold">Download our pre-formatted template with column headers</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="px-3 py-1.5 bg-white text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-300 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs transition-all whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" /> Sample CSV
              </button>
            </div>

            <label className="border-2 border-dashed border-gray-300 hover:border-rose-500 bg-gray-50 hover:bg-rose-50/30 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
              <Upload className="w-6 h-6 text-rose-500 mb-1" />
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

        {/* Extracted Dishes Preview & Live Editor Table */}
        {parsedItems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-black text-gray-900">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Extracted Dishes ({parsedItems.length} items ready)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddManualItem}
                  className="text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-1 text-[11px] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all parsed items?')) setParsedItems([]);
                  }}
                  className="text-gray-400 hover:text-rose-600 text-[11px] font-bold"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Filter Search */}
            {parsedItems.length > 8 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter extracted dishes..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            )}

            <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-2xl divide-y divide-gray-100 text-xs bg-white shadow-xs">
              {filteredItems.map((item, idx) => (
                <div key={idx} className="p-2 flex items-center gap-2 hover:bg-gray-50/80 transition-colors">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-9 h-9 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      className="w-full px-1.5 py-0.5 font-bold text-gray-900 bg-transparent border-b border-dashed border-gray-300 focus:border-rose-500 focus:outline-none text-xs"
                      placeholder="Dish Name"
                    />
                  </div>

                  <select
                    value={item.category}
                    onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                    className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 w-18 flex-shrink-0">
                    <span className="font-extrabold text-gray-400 text-xs">₹</span>
                    <input
                      type="number"
                      step="1"
                      value={item.price}
                      onChange={(e) => handleUpdateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-1 py-0.5 font-black text-rose-600 text-center bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(idx)}
                    className="p-1 text-gray-300 hover:text-rose-600 rounded-lg transition-colors flex-shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-400">
            {parsedItems.length > 0 ? `${parsedItems.length} dishes ready for import` : 'Upload photos to begin'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={loading || parsedItems.length === 0}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition-all disabled:opacity-50 active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              {loading ? 'Importing...' : `Import ${parsedItems.length} Dishes`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
