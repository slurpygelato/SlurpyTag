"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
      <p className="font-patrick text-2xl animate-pulse uppercase text-black">Caricamento...</p>
    </div>
  );

  return (
    <main className="min-h-screen p-6 bg-[#FDF6EC] max-w-md mx-auto flex flex-col text-black">
      
      {/* HEADER CON I 3 TASTI - LOG PUNTA DIRETTAMENTE ALLA CRONOLOGIA */}
      <header className="flex justify-between gap-3 mb-10 pt-4">
        {/* TASTO LOG - Navigazione Diretta */}
        <button 
          onClick={() => router.push('/dashboard/logs')}
          className="flex-1 bg-white border-[3px] border-black rounded-2xl py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <span className="block text-xl">📋</span>
          <span className="font-patrick font-bold uppercase text-[10px]">Log</span>
        </button>

        {/* TASTO CONTATTI */}
        <button 
          onClick={() => router.push('/dashboard/profile')}
          className="flex-1 bg-white border-[3px] border-black rounded-2xl py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <span className="block text-xl">👤</span>
          <span className="font-patrick font-bold uppercase text-[10px]">Contatti</span>
        </button>

        {/* TASTO AIUTO */}
        <a 
          href="mailto:info@slurpy-gelato.it?subject=Aiuto Slurpy Tag"
          className="flex-1 bg-white border-[3px] border-black rounded-2xl py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-center"
        >
          <span className="block text-xl">🆘</span>
          <span className="font-patrick font-bold uppercase text-[10px]">Aiuto</span>
        </a>
      </header>

      {/* TITOLO DASHBOARD */}
      <div className="mb-8">
        <h1 className="slurpy-logo text-4xl uppercase leading-none">I Miei<br/>Amici</h1>
        <p className="font-patrick text-gray-400 uppercase text-sm mt-2 tracking-widest italic">Gestisci i tuoi Slurpy Tag</p>
      </div>

      {/* LISTA ANIMALI */}
      <div className="space-y-6 flex-grow">
        {pets.length === 0 ? (
          <div className="bg-white border-[3px] border-black rounded-[30px] p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-patrick uppercase font-bold text-gray-400 text-sm">Non hai ancora aggiunto nessun animale 🦴</p>
          </div>
        ) : (
          pets.map((pet) => (
            <div 
              key={pet.id}
              onClick={() => router.push(`/dashboard/${pet.id}`)}
              className="bg-white border-[3px] border-black rounded-[30px] p-4 flex items-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Stato NFC Badge */}
              <div className={`absolute top-0 right-0 px-4 py-1 border-l-[3px] border-b-[3px] border-black font-patrick font-bold text-[10px] uppercase ${pet.is_connected ? 'bg-green-400' : 'bg-gray-200'}`}>
                {pet.is_connected ? "Tag Attivo" : "Non Connesso"}
              </div>

              <div className="w-20 h-20 rounded-2xl border-[3px] border-black overflow-hidden bg-gray-50 flex-shrink-0">
                {pet.image_url ? (
                  <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🐶</div>
                )}
              </div>
              
              <div>
                <h2 className="text-3xl font-bold uppercase font-patrick leading-none mb-1">{pet.name}</h2>
                <p className="font-patrick text-xs text-gray-400 uppercase tracking-widest">{pet.breed || "Razza non specificata"}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER / LOGOUT */}
      <button 
        onClick={handleSignOut}
        className="mt-10 font-patrick uppercase text-gray-400 text-xs underline decoration-dashed underline-offset-4 self-center active:text-black transition-colors"
      >
        Esci dall'account
      </button>

    </main>
  );
}