"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Owner {
  id?: string;
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
      // Recuperiamo i cani dell'utente
      const { data: pets } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', session.user.id);
      
      if (pets && pets.length > 0) {
        const petIds = pets.map(p => p.id);
        const { data: contacts } = await supabase
          .from('family_members')
          .select('*')
          .in('pet_id', petIds);

        if (contacts && contacts.length > 0) {
          // Filtriamo i duplicati per email per mostrare una lista pulita all'utente
          const uniqueContacts = contacts.filter((v, i, a) => 
            a.findIndex(t => t.email === v.email && t.name === v.name) === i
          );
          setOwners(uniqueContacts);
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
    // Validazione minima
    if (owners.some(o => !o.name || !o.phone)) {
      alert("Per favore, inserisci almeno Nome e Telefono per ogni contatto.");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessione scaduta");

      // 1. Recupera tutti i cani dell'utente
      const { data: pets } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', session.user.id);

      if (pets && pets.length > 0) {
        const petIds = pets.map(p => p.id);

        // 2. Cancella i vecchi contatti esistenti per questi cani
        const { error: deleteError } = await supabase
          .from('family_members')
          .delete()
          .in('pet_id', petIds);

        if (deleteError) throw deleteError;

        // 3. Prepara l'inserimento: ogni contatto viene replicato per ogni cane
        const toInsert = [];
        for (const petId of petIds) {
          for (const owner of owners) {
            toInsert.push({
              pet_id: petId,
              name: owner.name.toUpperCase(),
              phone: owner.phone,
              email: owner.email.toLowerCase()
            });
          }
        }

        // 4. Inserimento nel DB
        const { error: insertError } = await supabase
          .from('family_members')
          .insert(toInsert);

        if (insertError) throw insertError;
      }

      alert("Contatti salvati correttamente! ✅");
      router.push('/dashboard');
      router.refresh(); // Forza il refresh dei dati
    } catch (error: any) {
      alert("Errore nel salvataggio: " + error.message);
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
      
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pt-4">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="w-12 h-12 bg-white border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="slurpy-logo text-2xl uppercase italic">I tuoi contatti</h1>
        <div className="w-12" />
      </header>

      {/* Lista Contatti */}
      <div className="space-y-6 flex-grow">
        {owners.map((owner, i) => (
          <div key={i} className="bg-white border-[3px] border-black rounded-[30px] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4 relative">
            {owners.length > 1 && (
              <button 
                onClick={() => setOwners(owners.filter((_, idx) => idx !== i))}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >✕</button>
            )}
            
            <section className="space-y-1">
              <label className="font-bold uppercase text-[10px] ml-2 text-gray-400">Nome Proprietario</label>
              <input 
                type="text" 
                placeholder="ES. MARCO ROSSI" 
                className="slurpy-input text-center uppercase font-bold" 
                value={owner.name} 
                onChange={(e) => updateOwner(i, 'name', e.target.value)} 
              />
            </section>

            <section className="space-y-1">
              <label className="font-bold uppercase text-[10px] ml-2 text-gray-400">Cellulare / WhatsApp</label>
              <div className="slurpy-input bg-white flex items-center justify-center px-4">
                <PhoneInput 
                  defaultCountry="IT" 
                  placeholder="CELLULARE" 
                  value={owner.phone} 
                  onChange={(v) => updateOwner(i, 'phone', v || "")} 
                  className="w-full flex font-patrick text-xl" 
                />
              </div>
            </section>

            <section className="space-y-1">
              <label className="font-bold uppercase text-[10px] ml-2 text-gray-400">Email</label>
              <input 
                type="email" 
                placeholder="EMAIL" 
                className="slurpy-input text-center !normal-case" 
                value={owner.email} 
                onChange={(e) => updateOwner(i, 'email', e.target.value)} 
              />
            </section>
          </div>
        ))}

        <button 
          onClick={() => setOwners([...owners, { name: "", phone: "", email: "" }])}
          className="w-full py-4 border-[3px] border-dashed border-black/20 rounded-[25px] font-bold uppercase text-gray-400 hover:bg-white/50 transition-colors"
        >
          + Aggiungi un altro contatto
        </button>
      </div>

      {/* Pulsante Salva */}
      <button 
        onClick={handleSave} 
        disabled={saving} 
        className="btn-slurpy-primary w-full py-5 mt-8 text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase italic font-bold"
      >
        {saving ? "Salvataggio..." : "Salva Modifiche"}
      </button>

      <style jsx global>{`
        .PhoneInputInput { 
          font-family: 'Patrick Hand', cursive; /* O la tua variabile font */
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