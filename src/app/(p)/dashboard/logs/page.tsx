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

    // Recupera i log unendo i dati dei nomi dei cani
    const { data, error } = await supabase
      .from('scans')
      .select(`
        *,
        pets ( name )
      `)
      .order('created_at', { ascending: false });

    if (data) setLogs(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-6 bg-[#FDF6EC] max-w-md mx-auto text-black">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/dashboard')} className="w-12 h-12 bg-white border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><path d="M19 12H5M5 12L12 19M5 12L12 5" /></svg>
        </button>
        <h1 className="slurpy-logo text-2xl uppercase">Log Scansioni</h1>
      </header>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <p className="text-center font-patrick text-gray-400 uppercase">Nessuna scansione registrata.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white border-[3px] border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-[#FF8CB8] font-patrick uppercase">{log.pets?.name}</span>
                <span className="text-[10px] text-gray-400 font-patrick">
                  {new Date(log.created_at).toLocaleString('it-IT')}
                </span>
              </div>
              
              {log.lat ? (
                <a 
                  href={`https://www.google.com/maps?q=${log.lat},${log.lng}`}
                  target="_blank"
                  className="text-xs text-blue-500 underline font-patrick font-bold uppercase"
                >
                  📍 Vedi Posizione sulla Mappa
                </a>
              ) : (
                <p className="text-[10px] text-gray-400 font-patrick uppercase">Posizione non condivisa</p>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}