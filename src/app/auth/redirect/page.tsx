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
        console.log('[AuthRedirect] Starting...');
        
        // Verifica se l'utente è autenticato
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log('[AuthRedirect] Session:', session ? 'found' : 'not found');
        
        if (!session) {
          setStatus("Sessione non trovata...");
          router.push("/login?message=Sessione non trovata. Riprova.");
          return;
        }

        // Logica semplice: controlla se ha cani registrati
        const { data: petsData } = await supabase
          .from('pets')
          .select('id')
          .eq('owner_id', session.user.id)
          .limit(1);

        console.log('[AuthRedirect] Pets found:', petsData?.length || 0);

        if (petsData && petsData.length > 0) {
          // Utente esistente con cani → Dashboard
          setStatus("Bentornato! Caricamento dashboard...");
          router.push("/dashboard");
        } else {
          // Nuovo utente o senza cani → Registrazione
          setStatus("Completiamo il profilo...");
          router.push("/register");
        }
      } catch (error) {
        console.error("[AuthRedirect] Error:", error);
        setStatus("Errore. Riprova...");
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
