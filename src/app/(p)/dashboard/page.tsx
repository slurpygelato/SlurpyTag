"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useEmblaCarousel from 'embla-carousel-react';
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });
  
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?mode=signin");
        return;
      }
      const { data: petsData } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', session.user.id);

      if (petsData) setPets(petsData);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
      <p className="font-patrick text-2xl animate-pulse uppercase text-black">Caricamento...</p>
    </div>
  );

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto flex flex-col bg-[#FDF6EC]">
      <h1 className="slurpy-logo text-5xl text-center mb-10 mt-4">SLURPY TAG</h1>

      {/* Pulsanti Header - AGGIORNATI CON I PERCORSI CORRETTI */}
      <div className="grid grid-cols-3 gap-4 mb-12 px-4">
        {/* LOG: Punta alla pagina delle scansioni */}
        <Link href="/dashboard/logs" className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
          <div className="w-16 h-16 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-2xl">📋</div>
          <span className="font-patrick text-xs font-bold uppercase text-black">Log</span>
        </Link>
        
        {/* CONTATTI: Punta alla gestione dei contatti proprietario */}
        <Link href="/dashboard/profile" className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
          <div className="w-16 h-16 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-2xl">📞</div>
          <span className="font-patrick text-xs font-bold uppercase text-black">Contatti</span>
        </Link>
        
        {/* AIUTO: Mail diretta */}
        <a href="mailto:info@slurpy-gelato.it?subject=Aiuto Slurpy Tag" className="flex flex-col items-center gap-2 hover:scale-105 transition-transform">
          <div className="w-16 h-16 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-2xl">📧</div>
          <span className="font-patrick text-xs font-bold uppercase text-black">Aiuto</span>
        </a>
      </div>

      <h2 className="font-patrick text-3xl mb-6 uppercase text-black">I TUOI CANI:</h2>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {pets.map((pet) => (
            <div key={pet.id} className="flex-[0_0_85%] min-w-0 pl-4 pb-4">
              <div className="slurpy-card flex flex-col items-center p-6 relative h-full">
                <div className="w-full aspect-square bg-white rounded-[25px] border-2 border-black mb-6 overflow-hidden flex items-center justify-center shadow-inner relative">
                  {pet.image_url ? (
                    <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-7xl">🐶</span>
                  )}
                </div>
                
                <h3 className="font-patrick text-4xl font-bold uppercase mb-8 text-black">{pet.name}</h3>
                
                <div className="flex flex-col gap-3 w-full">
                  <Link 
                    href={`/dashboard/${pet.id}`} 
                    className="btn-slurpy-primary w-full text-center py-3 text-lg uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:brightness-95"
                  >
                    Gestisci Profilo
                  </Link>

                  <Link href={`/dashboard/${pet.id}/nfc`} className="w-full">
                    <div className={`flex items-center gap-3 p-3 rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-[1.02] active:scale-[0.98] ${pet.is_connected ? 'bg-[#98FF98]' : 'bg-gray-200 opacity-60'}`}>
                      <div className={`text-2xl ${pet.is_connected ? 'animate-pulse' : ''}`}>
                        {pet.is_connected ? '📶' : '📴'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-patrick font-bold uppercase text-[10px] leading-tight text-left text-black">
                          {pet.is_connected ? 'NFC COLLEGATO' : 'NFC NON CONNESSO'}
                        </span>
                        <span className="font-patrick text-[8px] uppercase text-black opacity-60 text-left">
                          {pet.is_connected ? `ID: ${pet.nfc_id || 'OK'}` : 'CLICCA PER ASSOCIARE'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex-[0_0_85%] min-w-0 pl-4 pb-4">
            <Link href="/register" className="slurpy-card flex flex-col items-center justify-center p-6 h-full border-dashed border-4 border-[#8e8e8e] opacity-60 hover:opacity-100 transition-opacity">
              <div className="text-5xl mb-4 text-[#8e8e8e]">+</div>
              <p className="font-patrick uppercase font-bold text-center text-[#8e8e8e]">Aggiungi un altro pelosetto</p>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-auto mb-6 pt-6 border-t-2 border-dashed border-black/10">
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }} 
          className="btn-slurpy-secondary w-full py-4 uppercase font-patrick text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:brightness-95 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          Log out
        </button>
      </div>
    </main>
  );
}