"use client";
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Verifica se l'utente è già autenticato
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Controlla se l'utente ha già registrato dei cani
        const { data: petsData } = await supabase
          .from('pets')
          .select('id')
          .eq('owner_id', session.user.id)
          .limit(1);
        
        if (petsData && petsData.length > 0) {
          router.push("/dashboard");
        } else {
          router.push("/register");
        }
      }
    };
    checkSession();
  }, [router]);

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