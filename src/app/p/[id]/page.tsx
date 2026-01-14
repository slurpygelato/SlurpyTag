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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-patrick uppercase text-xl text-black">Caricamento...</div>;
  
  if (!pet) return <div className="min-h-screen flex items-center justify-center font-patrick uppercase text-xl text-black">Profilo non trovato 🦴</div>;

  const whatsappLink = pet.owner_phone 
    ? `https://wa.me/${pet.owner_phone.replace(/\s+/g, '')}?text=Ciao! Ho trovato il tuo cane ${pet.name}!`
    : "#";

  return (
    <main className="min-h-screen bg-[#FDF6EC] p-6 pb-12 flex flex-col items-center text-black">
      <div className="w-full max-w-md bg-white border-[3px] border-black rounded-[40px] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
        
        <h1 className="slurpy-logo text-5xl mb-2 uppercase">Ciao! Sono</h1>
        <h2 className="text-6xl font-bold uppercase text-[#FF8CB8] font-patrick mb-6">{pet.name}</h2>
        
        <div className="w-48 h-48 mx-auto bg-gray-100 border-[3px] border-black rounded-full overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
          {pet.image_url ? (
            <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🐶</div>
          )}
        </div>

        {/* --- NUOVA SEZIONE INFORMAZIONI DETTAGLIATE --- */}
        <div className="space-y-4 text-left font-patrick mb-8">
          
          {/* Sesso e Microchip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F2F2F2] p-3 rounded-2xl border-2 border-black">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Sesso</p>
              <p className="text-lg uppercase font-bold">{pet.gender || "N.D."}</p>
            </div>
            <div className="bg-[#F2F2F2] p-3 rounded-2xl border-2 border-black">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Microchip</p>
              <p className="text-lg uppercase font-bold">{pet.microchip || "N.D."}</p>
            </div>
          </div>

          {/* Cosa gli piace */}
          <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-black">
            <p className="text-[10px] text-yellow-600 uppercase tracking-widest font-bold">Cosa mi piace ✨</p>
            <p className="text-md uppercase leading-tight mt-1">{pet.likes || "Nessuna nota specifica"}</p>
          </div>

          {/* Paure */}
          <div className="bg-purple-50 p-4 rounded-2xl border-2 border-black">
            <p className="text-[10px] text-purple-600 uppercase tracking-widest font-bold">Le mie paure ⛈️</p>
            <p className="text-md uppercase leading-tight mt-1">{pet.fears || "Nessuna paura segnalata"}</p>
          </div>

          {/* Note Salute (Box Rosso se presenti) */}
          <div className={`p-4 rounded-2xl border-2 border-black ${pet.health_notes ? 'bg-red-50 border-red-500' : 'bg-gray-50'}`}>
            <p className={`text-[10px] uppercase tracking-widest font-bold ${pet.health_notes ? 'text-red-600' : 'text-gray-400'}`}>Note sulla Salute 🏥</p>
            <p className={`text-md uppercase leading-tight mt-1 ${pet.health_notes ? 'text-red-900 font-bold' : ''}`}>
              {pet.health_notes || "Nessuna condizione medica particolare"}
            </p>
          </div>

          {/* --- FINE NUOVA SEZIONE --- */}

          <div className="bg-[#BAE1FF] p-6 rounded-[30px] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4">
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
                  className="w-full bg-[#25D366] text-white border-[3px] border-black rounded-2xl py-4 flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all font-bold uppercase italic"
                >
                  Apri WhatsApp
                </a>
              </div>
            ) : (
              <p className="text-center italic text-gray-500">Nessun contatto disponibile</p>
            )}
          </div>
        </div>

        <p className="mt-4 font-patrick text-sm text-gray-400 uppercase">Scansionato tramite Slurpy Tag ✨</p>
      </div>
    </main>
  );
}