'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registrato:', registration.scope);
        })
        .catch((error) => {
          console.log('SW errore:', error);
        });
    }
  }, []);

  return null;
}
