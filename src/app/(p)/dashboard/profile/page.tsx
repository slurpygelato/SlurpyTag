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
        // Selezioniamo anche id per poter ordinare in modo deterministico (più recente = id più alto)
        const { data: contacts } = await supabase
          .from('family_members')
          .select('id, name, phone, email')
          .in('pet_id', petIds)
          .order('id', { ascending: false }); // Più recente per primo

        if (contacts && contacts.length > 0) {
          // Raggruppiamo per EMAIL per evitare di vedere 10 schede se hai 10 cani
          // Mostriamo solo la lista "unica" di persone
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:42',message:'fetchContacts - raw contacts from DB',data:{contacts:JSON.parse(JSON.stringify(contacts))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          // Raggruppa per email, prendendo sempre il PRIMO record (che è il più recente grazie all'order by id DESC)
          // Così se ci sono duplicati, vince sempre il record più recente
          const unique = contacts.reduce((acc: Owner[], current: any) => {
            const existingIndex = acc.findIndex(item => item.email.toLowerCase() === current.email.toLowerCase());
            if (existingIndex === -1) {
              // Non esiste ancora, aggiungilo (senza il campo id, solo name, phone, email)
              return acc.concat([{ name: current.name, phone: current.phone, email: current.email }]);
            } else {
              // Esiste già, mantieni il primo (più recente) - non aggiornare
              return acc;
            }
          }, []);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:49',message:'fetchContacts - unique contacts after grouping',data:{unique:JSON.parse(JSON.stringify(unique))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:62',message:'updateOwner called',data:{index,field,value,valueType:typeof value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const newOwners = [...owners];
    newOwners[index][field] = value;
    setOwners(newOwners);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:66',message:'updateOwner state after update',data:{newOwner:newOwners[index]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  };

  const handleSave = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:68',message:'handleSave entry - owners state before save',data:{owners:JSON.parse(JSON.stringify(owners))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:86',message:'Before delete operation',data:{petIds},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const { error: deleteError, data: deleteData } = await supabase.from('family_members').delete().in('pet_id', petIds);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:88',message:'Delete operation result',data:{deleteError:deleteError?.message,deleteData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (deleteError) throw deleteError;

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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:100',message:'Data to insert prepared',data:{toInsert:JSON.parse(JSON.stringify(toInsert))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        // 4. Inserisci i nuovi dati puliti
        const { error: insertError, data: insertData } = await supabase.from('family_members').insert(toInsert);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:104',message:'Insert operation result',data:{insertError:insertError?.message,insertData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        if (insertError) throw insertError;
      }

      alert("Contatti aggiornati! ✅");
      
      // Reset locale e refresh
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:111',message:'Before fetchContacts call',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      await fetchContacts(); 
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:113',message:'After fetchContacts call',data:{owners:JSON.parse(JSON.stringify(owners))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      router.refresh();
      router.push('/dashboard');
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/82bc8c30-54e6-4fcf-944a-196c1776b2c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:115',message:'Error in handleSave',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
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