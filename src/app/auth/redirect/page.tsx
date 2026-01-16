"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthRedirectPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Autenticazione in corso...");

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Verifica se l'utente è autenticato
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setStatus("Sessione non trovata. Reindirizzamento...");
          router.push("/login?message=Sessione non trovata");
          return;
        }

        // Leggi l'intento salvato in localStorage
        const authIntent = localStorage.getItem('auth_intent');
        
        // Rimuovi l'intento dopo averlo letto
        localStorage.removeItem('auth_intent');

        // Se l'intento era "register", vai sempre a /register
        if (authIntent === 'register') {
          setStatus("Reindirizzamento alla registrazione...");
          router.push("/register");
          return;
        }

        // Se l'intento era "login" o non specificato, controlla se ha cani registrati
        const { data: petsData } = await supabase
          .from('pets')
          .select('id')
          .eq('owner_id', session.user.id)
          .limit(1);

        if (petsData && petsData.length > 0) {
          setStatus("Bentornato! Reindirizzamento alla dashboard...");
          router.push("/dashboard");
        } else {
          setStatus("Reindirizzamento alla registrazione...");
          router.push("/register");
        }
      } catch (error) {
        console.error("Errore durante il redirect:", error);
        setStatus("Errore. Reindirizzamento...");
        router.push("/login?message=Errore durante l'autenticazione");
      }
    };

    handleRedirect();
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FDF6EC]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF8CB8] border-t-transparent mx-auto mb-6"></div>
        <p className="font-patrick text-2xl uppercase text-gray-600">{status}</p>
      </div>
    </main>
  );
}
