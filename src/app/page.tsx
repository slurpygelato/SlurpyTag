"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// Helper per leggere un cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper per cancellare un cookie
function deleteCookie(name: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        // Controlla se c'è una sessione attiva (dopo OAuth redirect)
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('[Home] Session check:', session ? 'found' : 'not found');
        
        if (session) {
          // Utente loggato! Leggi l'intento
          const cookieIntent = getCookie('auth_intent');
          const localIntent = localStorage.getItem('auth_intent');
          const authIntent = cookieIntent || localIntent;
          
          console.log('[Home] Auth intent:', authIntent);
          
          // Pulisci l'intento
          deleteCookie('auth_intent');
          localStorage.removeItem('auth_intent');
          
          // Se l'intento era "register", vai a /register
          if (authIntent === 'register') {
            console.log('[Home] Redirecting to /register');
            router.push('/register');
            return;
          }
          
          // Altrimenti controlla se ha già cani registrati
          const { data: petsData } = await supabase
            .from('pets')
            .select('id')
            .eq('owner_id', session.user.id)
            .limit(1);
          
          if (petsData && petsData.length > 0) {
            console.log('[Home] User has pets, redirecting to /dashboard');
            router.push('/dashboard');
          } else {
            console.log('[Home] No pets, redirecting to /register');
            router.push('/register');
          }
          return;
        }
      } catch (error) {
        console.error('[Home] Error checking session:', error);
      }
      
      setChecking(false);
    };

    checkSessionAndRedirect();
  }, [router]);

  // Mostra loading mentre controlla la sessione
  if (checking) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
        <h1 className="slurpy-logo text-6xl mb-12">Slurpy Tag</h1>
        <p className="font-patrick text-xl text-gray-400 animate-pulse">Caricamento...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
      <h1 className="slurpy-logo text-6xl mb-12">Slurpy Tag</h1>
      
      <div className="flex flex-col gap-6 w-full max-w-xs">
        {/* REGISTRATI: Per i nuovi utenti (Porta alla creazione account, poi ai 7 step) */}
        <Link href="/login?mode=signup" 
          className="bg-white text-black border-[3px] border-black rounded-[25px] py-4 text-2xl font-patrick font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse hover:animate-none hover:scale-105 transition-all text-center uppercase">
          Registrati
        </Link>

        {/* ACCEDI: Per chi ha già un account (Porta alla Dashboard) */}
        <Link href="/login?mode=signin" className="btn-slurpy-primary text-center py-4 text-xl">
          ACCEDI
        </Link>
      </div>
    </main>
  );
}