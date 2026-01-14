"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Owner {
  name: string;
  phone: string;
  email: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const { data: pets } = await supabase.from('pets').select('id').eq('owner_id', session.user.id);
      
      if (pets && pets.length > 0) {
        const petIds = pets.map(p => p.id);
        const { data: contacts } = await supabase
          .from('family_members')
          .select('name, phone, email')
          .in('pet_id', petIds);

        if (contacts && contacts.length > 0) {
          // Raggruppiamo per EMAIL per evitare di vedere 10 schede se hai 10 cani
          // Mostriamo solo la lista "unica" di persone
          const unique = contacts.reduce((acc: Owner[], current) => {
            const x = acc.find(item => item.email.toLowerCase() === current.email.toLowerCase());
            if (!x) return acc.concat([current]);
            else return acc;
          }, []);
          setOwners(unique);
        } else {
          setOwners([{ name: "", phone: "", email: "" }]);
        }
      } else {
        setOwners([{ name: "", phone: "", email: "" }]);
      }
    } catch (error) {
      console.error("Errore fetch:", error);
    }
    setLoading(false);
  };

  const updateOwner = (index: number, field: keyof Owner, value: string) => {
    const newOwners = [...owners];
    newOwners[index][field] = value;
    setOwners(newOwners);
  };

  const handleSave = async () => {
    if (owners.some(o => !o.name || !o.phone)) {
      alert("Inserisci Nome e Telefono!");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessione scaduta");

      // 1. Trova tutti i cani dell'utente
      const { data: pets } = await supabase.from('pets').select('id').eq('owner_id', session.user.id);

      if (pets && pets.length > 0) {
        const petIds = pets.map(p => p.id);

        // 2. CANCELLA TUTTI i membri della famiglia per questi cani (Tabula Rasa)
        await supabase.from('family_members').delete().in('pet_id', petIds);

        // 3. Prepara i nuovi dati (ogni contatto per ogni cane)
        const toInsert = [];
        for (const petId of petIds) {
          for (const owner of owners) {
            toInsert.push({
              pet_id: petId,
              name: owner.name.toUpperCase(),
              phone: owner.phone,
              email: owner.email.toLowerCase().trim()
            });
          }
        }

        // 4. Inserisci i nuovi dati puliti
        const { error: insertError } = await supabase.from('family_members').insert(toInsert);
        if (insertError) throw insertError;
      }

      alert("Contatti aggiornati! ✅");
      
      // Reset locale e refresh
      await fetchContacts(); 
      router.refresh();
      router.push('/dashboard');
    } catch (error: any) {
      alert("Errore: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
      <p className="font-patrick text-2xl animate-pulse uppercase text-black">Caricamento...</p>
    </div>
  );

  return (
    <main className="min-h-screen p-4 pb-12 bg-[#FDF6EC] max-w-md mx-auto flex flex-col text-black font-patrick">
      <header className="flex items-center justify-between mb-8 pt-4">
        <button onClick={() => router.push('/dashboard')} className="w-12 h-12 bg-white border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="slurpy-logo text-2xl uppercase italic">I tuoi contatti</h1>
        <div className="w-12" />
      </header>

      <div className="space-y-6 flex-grow">
        {owners.map((owner, i) => (
          <div key={i} className="bg-white border-[3px] border-black rounded-[30px] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4 relative">
            {owners.length > 1 && (
              <button 
                onClick={() => setOwners(owners.filter((_, idx) => idx !== i))}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold"
              >✕</button>
            )}
            
            <section className="space-y-1">
              <label className="font-bold uppercase text-[10px] ml-2 text-gray-400">Nome</label>
              <input type="text" className="slurpy-input text-center uppercase font-bold" value={owner.name} onChange={(e) => updateOwner(i, 'name', e.target.value)} />
            </section>

            <section className="space-y-1">
              <label className="font-bold uppercase text-[10px] ml-2 text-gray-400">Cellulare</label>
              <div className="slurpy-input bg-white flex items-center justify-center px-4">
                <PhoneInput defaultCountry="IT" value={owner.phone} onChange={(v) => updateOwner(i, 'phone', v || "")} className="w-full flex text-xl" />
              </div>
            </section>

            <section className="space-y-1">
              <label className="font-bold uppercase text-[10px] ml-2 text-gray-400">Email</label>
              <input type="email" className="slurpy-input text-center !normal-case" value={owner.email} onChange={(e) => updateOwner(i, 'email', e.target.value)} />
            </section>
          </div>
        ))}

        <button 
          onClick={() => setOwners([...owners, { name: "", phone: "", email: "" }])}
          className="w-full py-4 border-[3px] border-dashed border-black/20 rounded-[25px] font-bold uppercase text-gray-400 hover:bg-white/50"
        >
          + Aggiungi contatto
        </button>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-slurpy-primary w-full py-5 mt-8 text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none uppercase italic font-bold">
        {saving ? "Salvataggio..." : "Salva Modifiche"}
      </button>

      <style jsx global>{`
        .PhoneInputInput { 
          font-family: inherit;
          font-size: 1.25rem;
          text-transform: uppercase;
          text-align: center;
          background: transparent;
          border: none;
          outline: none;
        }
      `}</style>
    </main>
  );
}