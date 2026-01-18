"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NFCPage() {
  const router = useRouter();
  const { id } = useParams();
  const [pet, setPet] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    const { data } = await supabase.from('pets').select('*').eq('id', id).single();
    if (data) setPet(data);
  };

  const handleConnectNFC = async () => {
    // 1. Verifica supporto browser
    if (!('NDEFReader' in window)) {
      setErrorMessage("Il tuo browser non supporta l'NFC. Usa Chrome su Android.");
      setStatus("error");
      return;
    }

    try {
      setStatus("scanning");
      
      // @ts-ignore
      const ndef = new NDEFReader();
      
      // Avvia lo scan per prendere il controllo dell'NFC
      // Questo impedisce al sistema operativo di aprire l'URL
      await ndef.scan();
      
      // L'URL che verrà scritto sulla medaglietta
      const publicUrl = `${window.location.origin}/p/${pet.id}`;

      // Quando un tag viene rilevato, scrivi immediatamente
      ndef.onreading = async () => {
        try {
          // Scrittura - sovrascrive sempre qualsiasi dato esistente
          await ndef.write({
            records: [{ recordType: "url", data: publicUrl }]
          });

          // Aggiornamento Database Supabase
          const { error } = await supabase
            .from('pets')
            .update({ 
              is_connected: true,
              NFC_id: pet.id
            })
            .eq('id', id);

          if (error) throw error;

          setStatus("success");
          fetchPet();
        } catch (writeError: any) {
          console.error(writeError);
          setErrorMessage("Errore di scrittura. Riprova avvicinando il tag.");
          setStatus("error");
        }
      };

    } catch (error: any) {
      console.error(error);
      setErrorMessage("Errore NFC. Assicurati che l'NFC sia attivo sul telefono.");
      setStatus("error");
    }
  };

  if (!pet) return <div className="p-10 text-center font-patrick uppercase text-black">Caricamento...</div>;

  return (
    <main className="min-h-screen p-4 pb-12 bg-[#FDF6EC] max-w-md mx-auto flex flex-col items-center text-black">
      
      <header className="w-full flex items-center justify-between mb-8 pt-4">
        <button onClick={() => router.push('/dashboard')} className="w-12 h-12 bg-white border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="slurpy-logo text-2xl uppercase">Configura Tag</h1>
        <div className="w-12" />
      </header>

      <div className="w-full bg-white border-[3px] border-black rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center space-y-6">
        
        {/* Feedback Visivo */}
        <div className={`w-32 h-32 border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors relative overflow-visible ${status === 'scanning' ? 'bg-[#FF8CB8]' : status === 'success' ? 'bg-green-400' : status === 'error' ? 'bg-red-400' : 'bg-[#F2F2F2]'}`}>
          {status === 'idle' && (
            <span className="text-3xl font-bold uppercase font-patrick text-gray-600">NFC</span>
          )}
          {status === 'scanning' && (
            <>
              {/* Cerchi pulsanti rosa */}
              <div className="absolute inset-0 rounded-full border-3 border-[#FF8CB8] animate-ping opacity-75" style={{ animation: 'pulse-radio 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
              <div className="absolute inset-0 rounded-full border-3 border-[#FF8CB8] animate-ping opacity-50" style={{ animation: 'pulse-radio 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.3s' }}></div>
              <div className="absolute inset-0 rounded-full border-3 border-[#FF8CB8] animate-ping opacity-25" style={{ animation: 'pulse-radio 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.6s' }}></div>
              <div className="absolute inset-0 rounded-full border-3 border-[#FF8CB8] animate-ping opacity-10" style={{ animation: 'pulse-radio 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.9s' }}></div>
            </>
          )}
          {status === 'success' && <span className="text-5xl">✅</span>}
          {status === 'error' && <span className="text-5xl">❌</span>}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold uppercase font-patrick">{pet.name}</h2>
          <p className="text-gray-400 font-patrick uppercase text-sm tracking-widest">Stato Collegamento</p>
        </div>

        {/* Badge Stato (Legge la tua colonna is_connected) */}
        <div className={`w-full py-4 border-2 border-dashed rounded-[20px] flex items-center justify-center gap-2 ${pet.is_connected ? 'border-green-300 bg-green-50' : 'border-gray-300'}`}>
          <span className="font-patrick font-bold uppercase">
            {pet.is_connected ? "✨ Tag Connesso" : "⭕ Non Connesso"}
          </span>
        </div>

        <p className="text-center font-patrick text-gray-500 text-sm uppercase px-4 leading-tight">
          {status === 'scanning' && "Avvicina la medaglietta al retro del telefono..."}
          {status === 'idle' && "Clicca il tasto e tocca la medaglietta per attivarla."}
          {status === 'success' && "Tag configurato con successo!"}
        </p>

        {status === 'error' && (
            <p className="text-red-500 font-patrick text-xs uppercase font-bold text-center">{errorMessage}</p>
        )}

        <button 
          onClick={handleConnectNFC}
          disabled={status === 'scanning'}
          className="btn-slurpy-primary w-full py-5 text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase italic font-bold disabled:opacity-50"
        >
          {status === 'scanning' ? "In ascolto..." : "Connetti Ora"}
        </button>
      </div>

      <button 
        onClick={() => router.push('/dashboard')}
        className="mt-8 font-patrick uppercase text-gray-400 text-sm underline decoration-dashed underline-offset-4"
      >
        Torna alla Dashboard
      </button>

      <style jsx>{`
        @keyframes pulse-radio {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>

    </main>
  );
}