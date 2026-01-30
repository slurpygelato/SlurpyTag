'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Controlla se è già installata come PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Controlla se l'utente ha già chiuso il banner
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      // Mostra di nuovo dopo 7 giorni
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Rileva iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Su iOS mostra il banner dopo 2 secondi
    if (isIOSDevice) {
      // Verifica che non sia già in standalone mode
      if (!(navigator as any).standalone) {
        setTimeout(() => setShowBanner(true), 2000);
      }
      return;
    }

    // Su Android/Chrome - intercetta l'evento beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto bg-white border-[3px] border-black rounded-[25px] p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start gap-3">
          {/* Icona */}
          <div className="w-14 h-14 bg-[#FF8CB8] rounded-2xl border-2 border-black flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🐾</span>
          </div>

          {/* Testo */}
          <div className="flex-1 min-w-0">
            <h3 className="font-patrick text-lg font-bold uppercase leading-tight">
              Installa Slurpy Tag
            </h3>
            <p className="font-patrick text-sm text-gray-500 leading-tight mt-1">
              {isIOS 
                ? "Tocca \"Condividi\" poi \"Aggiungi a Home\"" 
                : "Aggiungi l'app alla tua Home Screen!"
              }
            </p>
          </div>

          {/* Pulsante chiudi */}
          <button 
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Pulsanti azione */}
        <div className="flex gap-2 mt-4">
          {isIOS ? (
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 bg-[#FF8CB8] border-2 border-black rounded-xl font-patrick font-bold uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              Ho capito! 👍
            </button>
          ) : (
            <>
              <button
                onClick={handleDismiss}
                className="flex-1 py-3 bg-gray-100 border-2 border-black rounded-xl font-patrick font-bold uppercase text-sm"
              >
                Non ora
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 py-3 bg-[#FF8CB8] border-2 border-black rounded-xl font-patrick font-bold uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                Installa 📲
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
