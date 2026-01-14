"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useEmblaCarousel from 'embla-carousel-react';

export default function DashboardPage() {
  const router = useRouter();
  const [emblaRef] = useEmblaCarousel({ loop: false });
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", user.id);

    if (data) setPets(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
      <p className="font-patrick text-2xl animate-pulse uppercase text-black">Caricamento...</p>
    </div>
  );

  return (
    <main className="min-h-screen p-6 bg-[#FDF6EC] max-w-md mx-auto flex flex-col text-black">
      
      {/* HEADER CON I 3 TASTI ICONICI */}
      <header className="flex justify-between gap-4 mb-12 pt-4">
        <button onClick={() => router.push('/dashboard/logs')} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full aspect-square bg-white border-[3px] border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            <span className="text-2xl">📋</span>
          </div>
          <span className="font-patrick font-bold uppercase text-[10px] tracking-widest">Log</span>
        </button>

        <button onClick={() => router.push('/dashboard/profile')} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full aspect-square bg-white border-[3px] border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            <span className="text-2xl">📞</span>
          </div>
          <span className="font-patrick font-bold uppercase text-[10px] tracking-widest">Contatti</span>
        </button>

        <a href="mailto:info@slurpy-gelato.it" className="flex-1 flex flex-col items-center gap-1 group text-center">
          <div className="w-full aspect-square bg-white border-[3px] border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            <span className="text-2xl">✉️</span>
          </div>
          <span className="font-patrick font-bold uppercase text-[10px] tracking-widest">Aiuto</span>
        </a>
      </header>

      {/* TITOLO LOGO */}
      <div className="text-center mb-10">
        <h1 className="slurpy-logo text-5xl uppercase tracking-tighter">Slurpy Tag</h1>
      </div>

      <p className="font-patrick font-bold uppercase text-sm mb-4 ml-2">I tuoi cani:</p>

      {/* CAROSELLO DEI CANI (Grafica come da tua immagine) */}
      <div className="overflow-visible" ref={emblaRef}>
        <div className="flex gap-4">
          {pets.map((pet) => (
            <div key={pet.id} className="flex-[0_0_85%] min-w-0">
              <div className="bg-white border-[3px] border-black rounded-[40px] p-5 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                
                {/* Foto Cane */}
                <div className="w-full aspect-square rounded-[30px] border-[3px] border-black overflow-hidden mb-6 bg-gray-100">
                  {pet.image_url ? (
                    <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🐶</div>
                  )}
                </div>

                <h2 className="text-4xl font-bold uppercase font-patrick mb-6">{pet.name}</h2>

                {/* Tasto Rosa - GESTISCI PROFILO */}
                <button 
                  onClick={() => router.push(`/dashboard/${pet.id}`)}
                  className="w-full bg-[#FF8CB8] border-[3px] border-black py-5 rounded-[30px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all font-patrick font-bold uppercase italic text-xl mb-4"
                >
                  Gestisci Profilo
                </button>

                {/* Status NFC */}
                <button className="w-full bg-[#EEEEEE] border-[2px] border-black py-3 rounded-2xl flex items-center justify-center gap-3 opacity-60">
                   <span className="text-xl">📲</span>
                   <div className="text-left">
                     <p className="font-patrick font-bold text-[10px] uppercase leading-none">NFC Non Connesso</p>
                     <p className="font-patrick text-[8px] uppercase text-gray-500">Clicca per associare</p>
                   </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
        className="mt-auto pt-10 font-patrick uppercase text-gray-300 text-[10px] tracking-widest self-center"
      >
        Esci dall'account
      </button>

    </main>
  );
}