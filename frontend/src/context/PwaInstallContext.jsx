import React, { createContext, useContext, useState, useEffect } from 'react';

const PwaInstallContext = createContext();

export function PwaInstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem('spice_route_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Platform detection
  const [platform, setPlatform] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    const ua = window.navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'desktop';
  });

  useEffect(() => {
    // Check if app is already running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleModeChange = (e) => setIsInstalled(e.matches);
    try {
      mediaQuery.addEventListener('change', handleModeChange);
    } catch {
      mediaQuery.addListener(handleModeChange);
    }

    // Capture the beforeinstallprompt event (Chrome, Edge, Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt captured and ready');
    };

    // App installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('spice_route_pwa_dismissed', 'true');
      } catch {}
      console.log('[PWA] Spice Route app was successfully installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      try {
        mediaQuery.removeEventListener('change', handleModeChange);
      } catch {
        mediaQuery.removeListener(handleModeChange);
      }
    };
  }, []);

  // Trigger installation flow
  const triggerInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          try {
            localStorage.setItem('spice_route_pwa_dismissed', 'true');
          } catch {}
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('[PWA] Prompt error, opening instruction modal:', err);
        setIsModalOpen(true);
      }
    } else {
      // If native prompt not supported (iOS Safari, or already installed, or desktop), show instructions modal
      setIsModalOpen(true);
    }
  };

  const openInstallInstructions = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const dismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem('spice_route_pwa_dismissed', 'true');
    } catch {}
  };

  return (
    <PwaInstallContext.Provider
      value={{
        isInstalled,
        isBannerDismissed,
        isModalOpen,
        platform,
        setPlatform,
        triggerInstall,
        openInstallInstructions,
        closeModal,
        dismissBanner,
        hasNativePrompt: !!deferredPrompt
      }}
    >
      {children}
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error('usePwaInstall must be used within a PwaInstallProvider');
  }
  return context;
}
