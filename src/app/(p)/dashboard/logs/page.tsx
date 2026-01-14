"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('scans')
      .select(`*, pets ( name )`)
      .order('created_at', { ascending: false });

    if (data) setLogs(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
      <p className="font-patrick text-2xl animate-pulse uppercase text-black">Caricamento...</p>
    </div>
  );

  return (
    <main className="min-h-screen p-6 bg-[#FDF6EC] max-w-md mx-auto text-black">
      
      {/* HEADER CON IL TASTO INDIETRO STILIZZATO */}
      <header className="flex items-center gap-4 mb-8 pt-4">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="w-12 h-12 bg-white border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="slurpy-logo text-2xl uppercase italic">Cronologia Scansioni</h1>
      </header>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="bg-white border-[3px] border-black rounded-[30px] p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-patrick uppercase font-bold text-gray-400">Nessuna scansione 📡</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white border-[3px] border-black rounded-[30px] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-gray-400 font-patrick uppercase tracking-tighter mb-1">Cane Scansionato</p>
                  <p className="font-bold text-2xl text-[#FF8CB8] font-patrick uppercase leading-none">{log.pets?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-patrick uppercase mb-1 tracking-tighter">Data e Ora</p>
                  <p className="text-xs font-bold font-patrick uppercase">
                    {new Date(log.created_at).toLocaleDateString('it-IT')} <br/>
                    {new Date(log.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t-2 border-dashed border-black/10">
                {log.lat ? (
                  <a 
                    href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#BAE1FF] border-[3px] border-black py-3 rounded-2xl font-patrick font-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] transition-all"
                  >
                    📍 Vedi Posizione
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 w-full bg-gray-100 border-[3px] border-black py-3 rounded-2xl font-patrick font-bold uppercase text-xs text-gray-400">
                    Posizione non condivisa 🔒
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-10 text-center font-patrick text-[10px] text-gray-400 uppercase italic">
        I dati GPS vengono registrati solo se chi scansiona accetta la condivisione.
      </p>
    </main>
  );
}