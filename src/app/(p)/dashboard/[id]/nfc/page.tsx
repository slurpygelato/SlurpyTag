"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NFCPage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  return (
    <main className="min-h-screen p-4 pb-12 bg-[#FDF6EC] max-w-md mx-auto flex flex-col items-center">
      
      {/* HEADER CON FRECCIA STILIZZATA */}
      <header className="w-full flex items-center justify-between mb-8 pt-4">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="w-12 h-12 bg-white border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="slurpy-logo text-2xl uppercase">NFC Settings</h1>
        <div className="w-12" /> {/* Spacer per centrare il titolo */}
      </header>

      {/* CARD PRINCIPALE */}
      <div className="w-full bg-white border-[3px] border-black rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center space-y-6">
        
        {/* ICONA TELEFONO */}
        <div className="w-32 h-32 bg-[#F2F2F2] border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="relative">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="2" width="14" height="20" rx="3" stroke="black" strokeWidth="2"/>
                <path d="M12 18H12.01" stroke="black" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <div className="absolute -top-1 -right-4 bg-cyan-400 border-2 border-black text-[10px] font-bold px-1 rounded-md">
              OFF
            </div>
          </div>
        </div>

        {/* INFO CANE */}
        <div className="text-center">
          <h2 className="text-3xl font-bold uppercase font-patrick">Alabama</h2>
          <p className="text-gray-400 font-patrick uppercase text-sm tracking-widest">Stato Medaglietta</p>
        </div>

        {/* STATO CONNESSIONE */}
        <div className="w-full py-4 border-2 border-dashed border-gray-300 rounded-[20px] flex items-center justify-center gap-2">
          <span className="text-red-500 text-xl">❌</span>
          <span className="font-patrick font-bold uppercase text-black">Non Collegata</span>
        </div>

        <p className="text-center font-patrick text-gray-500 text-sm uppercase px-4">
          Clicca il tasto qui sotto per associare una medaglietta a questo cane.
        </p>

        {/* BOTTONE PINK SLURPY */}
        <button 
          className="btn-slurpy-primary w-full py-5 text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase italic font-bold"
        >
          Connetti Ora
        </button>
      </div>

      {/* FOOTER LINK */}
      <button 
        onClick={() => router.push('/dashboard')}
        className="mt-8 font-patrick uppercase text-gray-400 text-sm underline decoration-dashed underline-offset-4"
      >
        Torna alla Dashboard
      </button>

    </main>
  );
}