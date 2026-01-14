"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useEmblaCarousel from 'embla-carousel-react';

export default function DashboardPage() {
  const router = useRouter();
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "center" });
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
      .eq("owner_id", user.id)
      .order('created_at', { ascending: true });

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
      
      {/* 1. HEADER CON I 3 TASTI (Stile Immagine 1) */}
      <header className="flex justify-between gap-4 mb-10 pt-4">
        <button onClick={() => router.push('/dashboard/logs')} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full aspect-square bg-white border-[3px] border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
            <span className="text-2xl">📋</span>
          </div>
          <span className="font-patrick font-bold uppercase text-[10px] tracking-widest">Log</span>
        </button>

        <button onClick={() => router.push('/dashboard/profile')} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full aspect-square bg-white border-[3px] border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
            <span className="text-2xl">👤</span>
          </div>
          <span className="font-patrick font-bold uppercase text-[10px] tracking-widest">Contatti</span>
        </button>

        <a href="mailto:info@slurpy-gelato.it" className="flex-1 flex flex-col items-center gap-1 text-center">
          <div className="w-full aspect-square bg-white border-[3px] border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
            <span className="text-2xl">🆘</span>
          </div>
          <span className="font-patrick font-bold uppercase text-[10px] tracking-widest">Aiuto</span>
        </a>
      </header>

      {/* 2. TITOLO LOGO CENTRALE */}
      <div className="text-center mb-8">
        <h1 className="slurpy-logo text-5xl uppercase tracking-tighter">Slurpy Tag</h1>
      </div>

      {/* 3. CAROSELLO (Cani + Tasto Aggiungi) */}
      <div className="overflow-visible flex-grow" ref={emblaRef}>
        <div className="flex gap-5">
          {/* Loop dei Cani */}
          {pets.map((pet) => (
            <div key={pet.id} className="flex-[0_0_85%] min-w-0">
              <div className="bg-white border-[3px] border-black rounded-[40px] p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                <div className="w-full aspect-square rounded-[30px] border-[3px] border-black overflow-hidden mb-6 bg-gray-50">
                  {pet.image_url ? (
                    <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🐶</div>
                  )}
                </div>
                <h2 className="text-4xl font-bold uppercase font-patrick mb-6">{pet.name}</h2>
                <button 
                  onClick={() => router.push(`/dashboard/${pet.id}`)}
                  className="w-full bg-[#FF8CB8] border-[3px] border-black py-5 rounded-[25px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all font-patrick font-bold uppercase italic text-xl"
                >
                  Gestisci Profilo
                </button>
              </div>
            </div>
          ))}

          {/* TASTO AGGIUNGI NUOVO CANE (Sempre alla fine del carosello) */}
          <div className="flex-[0_0_85%] min-w-0">
            <button 
              onClick={() => router.push('/dashboard/new')}
              className="w-full aspect-[0.8] bg-white border-[3px] border-black border-dashed rounded-[40px] flex flex-col items-center justify-center gap-4 hover:bg-gray-50 transition-colors shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              <div className="w-20 h-20 bg-[#F2F2F2] rounded-full flex items-center justify-center text-4xl border-2 border-black">+</div>
              <p className="font-patrick font-bold uppercase text-xl">Aggiungi Cane</p>
            </button>
          </div>
        </div>
      </div>

      {/* 4. LOGOUT DISCRETO */}
      <button 
        onClick={async () => { await supabase.auth.signOut(); router.push("/"); }}
        className="mt-8 mb-4 font-patrick uppercase text-gray-300 text-[10px] tracking-widest self-center"
      >
        Esci dall'account
      </button>

    </main>
  );
}