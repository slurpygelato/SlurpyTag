"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        // Controlla se c'è una sessione attiva
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('[Home] Session check:', session ? 'found' : 'not found');
        
        if (session) {
          // Utente loggato! Controlla se ha già cani registrati
          const { data: petsData } = await supabase
            .from('pets')
            .select('id')
            .eq('owner_id', session.user.id)
            .limit(1);
          
          if (petsData && petsData.length > 0) {
            // Ha già cani → Dashboard
            console.log('[Home] User has pets → dashboard');
            router.push('/dashboard');
          } else {
            // Non ha cani → Registrazione multi-step
            console.log('[Home] No pets → register');
            router.push('/register');
          }
          return;
        }
      } catch (error) {
        console.error('[Home] Error:', error);
      }
      
      setChecking(false);
    };

    checkSessionAndRedirect();
  }, [router]);

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
        <Link href="/login?mode=signup" 
          className="bg-white text-black border-[3px] border-black rounded-[25px] py-4 text-2xl font-patrick font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse hover:animate-none hover:scale-105 transition-all text-center uppercase">
          Registrati
        </Link>

        <Link href="/login?mode=signin" className="btn-slurpy-primary text-center py-4 text-xl">
          ACCEDI
        </Link>
      </div>
    </main>
  );
}