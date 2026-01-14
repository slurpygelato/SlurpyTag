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

  // Link WhatsApp dinamico
  const whatsappLink = pet.owner_phone 
    ? `https://wa.me/${pet.owner_phone.replace(/\s+/g, '')}?text=Ciao! Ho trovato il tuo cane ${pet.name}!`
    : "#";

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

          <div className="bg-[#BAE1FF] p-6 rounded-[30px] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-center font-bold uppercase mb-4 text-lg">Contatta il mio proprietario</p>
            
            {pet.owner_phone ? (
              <div className="space-y-4">
                <a 
                  href={`tel:${pet.owner_phone}`} 
                  className="block text-center text-2xl font-bold underline decoration-2 underline-offset-4"
                >
                  {pet.owner_phone}
                </a>
                
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white border-[3px] border-black rounded-2xl py-3 flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all font-bold uppercase italic"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.938 3.659 1.434 5.628 1.434h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Apri WhatsApp
                </a>
              </div>
            ) : (
              <p className="text-center italic text-gray-500">Nessun contatto disponibile</p>
            )}
          </div>
        </div>

        <p className="mt-8 font-patrick text-sm text-gray-400 uppercase">Scansionato tramite Slurpy Tag ✨</p>
      </div>
    </main>
  );
}