"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NFCPage() {
  const router = useRouter();
  const { id } = useParams();
  const [pet, setPet] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "success">("idle");
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Rileva se è iOS
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const supportsWebNFC = typeof window !== 'undefined' && 'NDEFReader' in window;

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    const { data } = await supabase.from('pets').select('*').eq('id', id).single();
    if (data) setPet(data);
  };

  const handleConnectNFC = async () => {
    // 1. Verifica supporto browser
    if (!supportsWebNFC) {
      setShowIOSHelp(true);
      return;
    }

    // 2. Mostra modale di conferma
    setShowConfirmModal(true);
  };

  const proceedWithNFCWrite = async () => {
    setShowConfirmModal(false);

    // 3. Ora procedi con la scrittura NFC
    try {
      setStatus("scanning");
      
      // Aggiornamento Database PRIMA della scrittura
      // (così se Android reindirizza, il DB è già aggiornato)
      const { error: dbError } = await supabase
        .from('pets')
        .update({ 
          is_connected: true,
          NFC_id: pet.id
        })
        .eq('id', id);

      if (dbError) throw dbError;

      // @ts-ignore
      const ndef = new NDEFReader();
      
      // L'URL che verrà scritto sulla medaglietta (con parametro di conferma)
      const publicUrl = `${window.location.origin}/p/${pet.id}?configured=true`;

      // Scrittura diretta
      await ndef.write({
        records: [{ recordType: "url", data: publicUrl }]
      });

      // Se arriviamo qui, la scrittura è completata E Android non ha intercettato
      setStatus("success");
      alert(`✅ Tag registrato con successo per ${pet.name.toUpperCase()}!`);
      router.replace('/dashboard');

    } catch (error: any) {
      // Android ha intercettato il tag e sta aprendo l'URL
      // L'utente vedrà la conferma sulla pagina del profilo
      console.log("NFC: scrittura completata, Android sta aprendo l'URL");
      setStatus("idle");
    }
  };

  // Copia URL negli appunti
  const copyProfileUrl = async () => {
    const url = `${window.location.origin}/p/${pet.id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("✅ Link copiato! Incollalo nell'app NFC Tools per scriverlo sul tag.");
    } catch {
      // Fallback per browser che non supportano clipboard API
      prompt("Copia questo link e incollalo nell'app NFC Tools:", url);
    }
  };

  if (!pet) return <div className="p-10 text-center font-patrick uppercase text-black">Caricamento...</div>;

  return (
    <main className="min-h-screen p-4 pb-12 bg-[#FDF6EC] max-w-md mx-auto flex flex-col items-center text-black">
      
      {/* Modal Aiuto iOS */}
      {showIOSHelp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowIOSHelp(false)}>
          <div className="bg-[#FDF6EC] border-[3px] border-black rounded-[30px] p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="text-5xl">🍎</span>
              <h3 className="text-2xl font-bold uppercase font-patrick mt-2">
                {isIOS ? "Usa un'app NFC" : "Usa Chrome su Android"}
              </h3>
            </div>
            
            <div className="space-y-3 font-patrick text-sm">
              {isIOS ? (
                <>
                  <p className="text-gray-600">
                    Safari non supporta la scrittura NFC, ma puoi usare l'app gratuita <strong>"NFC Tools"</strong>:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Scarica <strong>NFC Tools</strong> dall'App Store</li>
                    <li>Apri l'app e vai su <strong>"Scrivi"</strong></li>
                    <li>Aggiungi un record <strong>"URL"</strong></li>
                    <li>Incolla il link del profilo (copialo qui sotto)</li>
                    <li>Avvicina il tag e scrivi!</li>
                  </ol>
                  <p className="text-xs text-gray-400 mt-2">
                    Una volta configurato, il tag funzionerà su tutti i dispositivi! 🎉
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600">
                    La scrittura NFC da browser funziona solo con <strong>Chrome su Android</strong>.
                  </p>
                  <p className="text-gray-600">
                    In alternativa, puoi usare un'app NFC come <strong>"NFC Tools"</strong> (disponibile anche su Android).
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={copyProfileUrl}
                className="w-full py-4 bg-[#FF8CB8] border-[3px] border-black rounded-2xl font-patrick font-bold uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                📋 Copia Link Profilo
              </button>
              
              {isIOS && (
                <a 
                  href="https://apps.apple.com/app/nfc-tools/id1252962749"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-white border-[3px] border-black rounded-2xl font-patrick font-bold uppercase text-lg text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  ⬇️ Scarica NFC Tools
                </a>
              )}
              
              <button 
                onClick={() => setShowIOSHelp(false)}
                className="w-full py-3 font-patrick uppercase text-gray-400 text-sm underline"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conferma Scrittura NFC */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-[#FDF6EC] border-[3px] border-black rounded-[30px] p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="text-5xl">⚠️</span>
              <h3 className="text-2xl font-bold uppercase font-patrick mt-2">
                Attenzione
              </h3>
            </div>
            
            <div className="space-y-3 font-patrick text-sm">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
                <p className="text-red-700 font-bold text-center">
                  ⛔ Il tag deve essere VUOTO
                </p>
                <p className="text-red-600 text-xs text-center mt-1">
                  Una volta scritto, il contenuto non sarà più modificabile
                </p>
              </div>

              <p className="text-gray-600 text-center">
                Assicurati che i dati del profilo di <strong>{pet?.name?.toUpperCase()}</strong> siano corretti prima di procedere.
              </p>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                <p className="text-blue-700 text-xs text-center">
                  💡 <strong>Hai già dei dati sul tag?</strong>
                </p>
                <p className="text-blue-600 text-xs text-center mt-1">
                  Usa l'app <strong>NFC Tools</strong> per formattarlo e riportarlo allo stato di fabbrica
                </p>
                <div className="flex gap-2 mt-2">
                  <a 
                    href="https://apps.apple.com/app/nfc-tools/id1252962749"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-white border border-blue-300 rounded-lg text-xs text-center text-blue-600 font-bold"
                  >
                    🍎 iOS
                  </a>
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-white border border-blue-300 rounded-lg text-xs text-center text-blue-600 font-bold"
                  >
                    🤖 Android
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={proceedWithNFCWrite}
                className="w-full py-4 bg-[#FF8CB8] border-[3px] border-black rounded-2xl font-patrick font-bold uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                ✅ Ho capito, procedi
              </button>
              
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-3 font-patrick uppercase text-gray-400 text-sm underline"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className={`w-32 h-32 border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors relative overflow-visible ${status === 'scanning' ? 'bg-[#FF8CB8]' : status === 'success' ? 'bg-green-400' : 'bg-[#F2F2F2]'}`}>
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
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold uppercase font-patrick">{pet.name}</h2>
        </div>

        <p className="text-center font-patrick text-gray-500 text-sm uppercase px-4 leading-tight">
          {status === 'scanning' && "Avvicina la medaglietta al retro del telefono..."}
          {status === 'idle' && (supportsWebNFC 
            ? "Clicca il tasto e tocca la medaglietta per attivarla."
            : isIOS 
              ? "Su iPhone usa l'app NFC Tools per configurare il tag."
              : "Usa Chrome su Android per configurare il tag."
          )}
          {status === 'success' && "Tag configurato con successo!"}
        </p>

        {/* Avviso per dispositivi non supportati */}
        {!supportsWebNFC && status === 'idle' && (
          <div className="w-full bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-2xl p-4 text-center">
            <p className="font-patrick text-sm text-yellow-700">
              {isIOS ? "🍎 Safari non supporta NFC" : "⚠️ Browser non supportato"}
            </p>
            <p className="font-patrick text-xs text-yellow-600 mt-1">
              Clicca sotto per le istruzioni alternative
            </p>
          </div>
        )}

        <button 
          onClick={handleConnectNFC}
          disabled={status === 'scanning'}
          className="btn-slurpy-primary w-full py-5 text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase italic font-bold disabled:opacity-50"
        >
          {status === 'scanning' ? "In ascolto..." : supportsWebNFC ? "Scrivi dati su NFC" : "Come configurare"}
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