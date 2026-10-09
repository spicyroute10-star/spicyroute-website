import React, { useState, useEffect } from 'react';
import { usePwaInstall } from '../../context/PwaInstallContext';
import { Smartphone, X, Flame, Sparkles, ChevronRight } from 'lucide-react';

export default function PwaInstallBanner({ activeView }) {
  const { isInstalled, isBannerDismissed, triggerInstall, dismissBanner } = usePwaInstall();
  const [isVisible, setIsVisible] = useState(false);

  // Suppress banner on critical workflows: checkout, login, tracking
  const isExcludedView = ['login', 'my-orders', 'admin', 'vendor'].includes(activeView);

  useEffect(() => {
    // Show banner with a subtle 2-second delay if not installed & not dismissed
    if (!isInstalled && !isBannerDismissed && !isExcludedView) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isInstalled, isBannerDismissed, isExcludedView]);

  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Install App Banner"
      className="fixed bottom-20 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl border border-rose-100 ring-1 ring-black/5 flex flex-col gap-3 relative overflow-hidden">
        
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600"></div>

        {/* Close Button */}
        <button
          onClick={dismissBanner}
          className="absolute top-3.5 right-3.5 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          title="Dismiss"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Card Header & Content */}
        <div className="flex items-start gap-3 pr-6">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-rose-200/60 bg-rose-50">
            <img src="/logo.png" alt="Spicy Route Logo" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-black text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Quick Access
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-gray-900 leading-snug">
              🍔 Your Food App, One Tap Away!
            </h4>
            <p className="text-xs font-semibold text-gray-500 mt-0.5 leading-relaxed">
              Skip the browser hassle. Add us to your Home Screen and order faster.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={triggerInstall}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-2xl text-xs font-black shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>📱 Add to Home Screen</span>
          </button>

          <button
            onClick={dismissBanner}
            className="py-2.5 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-xs font-extrabold transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </aside>
  );
}
