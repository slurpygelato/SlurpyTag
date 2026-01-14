"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function PublicPetProfile() {
  const { id } = useParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setPet(data);
      setLoading(false);
    };

    if (id) fetchPet();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-patrick uppercase text-xl">Caricamento...</div>;
  
  if (!pet) return <div className="min-h-screen flex items-center justify-center font-patrick uppercase text-xl">Profilo non trovato 🦴</div>;

  return (
    <main className="min-h-screen bg-[#FDF6EC] p-6 flex flex-col items-center">
      <div className="w-full max-w-md bg-white border-[3px] border-black rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
        
        <h1 className="slurpy-logo text-5xl mb-2 uppercase">Ciao! Sono</h1>
        <h2 className="text-6xl font-bold uppercase text-[#FF8CB8] font-patrick mb-6">{pet.name}</h2>
        
        <div className="w-48 h-48 mx-auto bg-gray-100 border-[3px] border-black rounded-full overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
          {pet.image_url ? (
            <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🐶</div>
          )}
        </div>

        <div className="space-y-4 text-left font-patrick">
          <div className="bg-[#F2F2F2] p-4 rounded-2xl border-2 border-black">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Informazioni</p>
            <p className="text-xl uppercase font-bold">{pet.breed || "Razza non specificata"}</p>
          </div>

          <div className="bg-cyan-100 p-4 rounded-2xl border-2 border-black">
            <p className="text-xs text-cyan-600 uppercase tracking-widest">Contatta il mio umano</p>
            <p className="text-xl font-bold uppercase">Il mio proprietario ti aspetta!</p>
            {/* Qui potrai aggiungere il numero di telefono o il tasto WhatsApp in futuro */}
          </div>
        </div>

        <p className="mt-8 font-patrick text-sm text-gray-400 uppercase">Scansionato tramite Slurpy Tag ✨</p>
      </div>
    </main>
  );
}