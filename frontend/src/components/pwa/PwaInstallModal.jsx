import React, { useState } from 'react';
import { usePwaInstall } from '../../context/PwaInstallContext';
import { 
  X, Smartphone, Share2, PlusSquare, MoreVertical, 
  CheckCircle, ArrowUpRight, Flame, Sparkles, Laptop, Check
} from 'lucide-react';

export default function PwaInstallModal() {
  const { isModalOpen, closeModal, platform } = usePwaInstall();
  const [selectedDevice, setSelectedDevice] = useState(platform);

  if (!isModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={closeModal}
    >
      <div 
        className="bg-white rounded-3xl max-w-lg w-full my-auto p-5 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Flame className="w-6 h-6 fill-amber-200 text-amber-200" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                {selectedDevice === 'ios' ? '📱 Make ordering even faster!' : 'Add us to your Home Screen in seconds 🚀'}
              </h3>
              <p className="text-xs font-semibold text-gray-400">
                Install Spice Route for quick 1-tap food ordering
              </p>
            </div>
          </div>
          <button 
            onClick={closeModal}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Switcher Pills */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 text-xs font-black">
          <button
            type="button"
            onClick={() => setSelectedDevice('android')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedDevice === 'android' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🤖 Android</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedDevice('ios')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedDevice === 'ios' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>🍎 iPhone / iPad</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedDevice('desktop')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              selectedDevice === 'desktop' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>💻 Laptop / PC</span>
          </button>
        </div>

        {/* INSTRUCTIONS CONTENT */}

        {/* 1. iOS / iPhone / Safari Flow */}
        {selectedDevice === 'ios' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] font-bold text-amber-900 flex items-center gap-2">
              <span className="text-base">💡</span>
              <span>Please open this website in <strong>Apple Safari</strong> on iPhone/iPad to add to your Home Screen.</span>
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-gray-900 flex items-center gap-1.5 flex-wrap">
                    <span>Tap the</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[11px] font-extrabold">
                      <Share2 className="w-3.5 h-3.5" /> Share button
                    </span>
                    <span>in Safari</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Located in the bottom toolbar on iPhone or top bar on iPad.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-gray-900 flex items-center gap-1.5 flex-wrap">
                    <span>Scroll down and tap</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-gray-800 border border-gray-300 rounded-lg text-[11px] font-extrabold shadow-2xs">
                      <PlusSquare className="w-3.5 h-3.5 text-gray-700" /> "Add to Home Screen"
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Found in the action list underneath your contacts.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-gray-900">
                    Tap <span className="text-blue-600 font-black">"Add"</span> at the top-right corner.
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Confirms the app name and icon.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-emerald-950">
                    The Spice Route app icon appears on your Home Screen!
                  </div>
                  <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                    Tap it anytime to launch full-screen without browser bars.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Android / Chrome Flow */}
        {selectedDevice === 'android' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-gray-900 flex items-center gap-1.5 flex-wrap">
                    <span>Tap the</span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-white text-gray-800 border border-gray-300 rounded-lg text-[11px] font-extrabold shadow-2xs">
                      <MoreVertical className="w-3.5 h-3.5 text-gray-600" /> menu
                    </span>
                    <span>in Chrome</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Located in the top right corner of Chrome.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-gray-900 flex items-center gap-1.5 flex-wrap">
                    <span>Select</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-gray-800 border border-gray-300 rounded-lg text-[11px] font-extrabold shadow-2xs">
                      <Smartphone className="w-3.5 h-3.5 text-rose-600" /> "Add to Home screen"
                    </span>
                    <span>or <strong>"Install app"</strong></span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Usually located midway down the Chrome menu options.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-gray-900">
                    Tap <span className="text-rose-600 font-black">"Install"</span> or <span className="text-rose-600 font-black">"Add"</span>.
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Chrome will instantly install the web app to your phone.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-emerald-950">
                    Find the Spice Route app on your Home Screen!
                  </div>
                  <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                    Fast access with offline caching and instant ordering.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Desktop / PC Flow */}
        {selectedDevice === 'desktop' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-gray-900">
                    Look at the address bar in Chrome or Microsoft Edge.
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Click the <strong>Install App icon (⊕ or computer with arrow)</strong> on the right side of the address bar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <div className="text-xs font-black text-gray-900">
                    Click <span className="text-rose-600 font-black">"Install"</span> in the prompt.
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Spice Route opens in its own clean window and can be pinned to your taskbar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-2xl text-xs font-extrabold shadow-md transition-colors"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
}
