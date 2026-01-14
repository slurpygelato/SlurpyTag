"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import useEmblaCarousel from 'embla-carousel-react';

export default function PetManagePage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emblaRef] = useEmblaCarousel({ loop: false });
  
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) {
      setPet(data);
      setFormData(data);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('pets')
      .update({
        name: formData.name,
        nickname: formData.nickname,
        city: formData.city,
        province: formData.province,
        region: formData.region,
        likes: formData.likes,
        fears: formData.fears,
        health_notes: formData.health_notes,
        gender: formData.gender,
        microchip: formData.microchip
      })
      .eq('id', id);

    if (error) {
      alert("Errore durante il salvataggio: " + error.message);
      setSaving(false);
    } else {
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 500);
    }
  };

  // --- LOGICA GESTIONE FOTO ---
  const handlePhotoClick = (index: number) => {
    setUploadingIndex(index);
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadingIndex === null || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${pet.owner_id}/${fileName}`;

    setSaving(true);

    try {
      // 1. Upload su Storage
      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Ottieni URL pubblico
      const { data: publicUrlData } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath);
      
      const newUrl = publicUrlData.publicUrl;

      // 3. Update nel database (decidiamo quale colonna in base all'indice)
      const columnToUpdate = uploadingIndex === 0 ? 'image_url' : (uploadingIndex === 1 ? 'image_url_2' : 'image_url_3');
      
      const { error: updateError } = await supabase
        .from('pets')
        .update({ [columnToUpdate]: newUrl })
        .eq('id', id);

      if (updateError) throw updateError;

      // 4. Refresh dati locali
      await fetchPet();
      alert("Foto aggiornata! 📸");
    } catch (error: any) {
      alert("Errore upload: " + error.message);
    } finally {
      setSaving(false);
      setUploadingIndex(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
      <p className="font-patrick text-2xl animate-pulse uppercase text-black">Caricamento...</p>
    </div>
  );

  // Creiamo un array fisso di 3 slot per le foto
  const slots = [
    { url: pet?.image_url, label: "Foto 1" },
    { url: pet?.image_url_2, label: "Foto 2" },
    { url: pet?.image_url_3, label: "Foto 3" }
  ];

  return (
    <main className="min-h-screen p-4 pb-12 bg-[#FDF6EC] max-w-md mx-auto flex flex-col text-black">
      {/* Input file nascosto */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />

      <header className="flex items-center justify-between mb-6 pt-4">
        <button onClick={() => router.push('/dashboard')} className="w-12 h-12 bg-white border-[3px] border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="slurpy-logo text-2xl uppercase">Modifica Profilo</h1>
        <div className="w-12" />
      </header>

      {/* Carosello Foto Gestibile */}
      <div className="mb-8">
        <div className="overflow-hidden rounded-[30px] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white" ref={emblaRef}>
          <div className="flex">
            {slots.map((slot, index) => (
              <div key={index} className="flex-[0_0_100%] aspect-square relative group">
                {slot.url ? (
                  <>
                    <img src={slot.url} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handlePhotoClick(index)}
                      className="absolute bottom-4 right-4 bg-white border-2 border-black p-3 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
                    >
                      📸
                    </button>
                  </>
                ) : (
                  <div 
                    onClick={() => handlePhotoClick(index)}
                    className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border-dashed border-2 border-gray-300 cursor-pointer"
                  >
                    <span className="text-4xl text-gray-300">+</span>
                    <p className="font-patrick text-gray-300 uppercase text-xs mt-2">Aggiungi Foto {index + 1}</p>
                  </div>
                )}
                {/* Overlay caricamento */}
                {saving && uploadingIndex === index && (
                   <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                      <p className="font-patrick font-bold animate-bounce">CARICAMENTO...</p>
                   </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="text-center font-patrick text-[10px] text-gray-400 mt-3 uppercase italic">
          Scorri per gestire le 3 foto • Clicca 📸 per cambiare
        </p>
      </div>

      {/* Resto del form (identico a prima) */}
      <div className="space-y-6">
        <section className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setFormData({...formData, gender: formData.gender === 'MASCHIO' ? 'FEMMINA' : 'MASCHIO'})}
            className={`p-3 rounded-2xl border-[3px] border-black transition-all text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${formData.gender === 'FEMMINA' ? 'bg-[#FFB7D5]' : 'bg-[#BAE1FF]'}`}
          >
            <p className="text-[10px] font-bold text-black/40 uppercase font-patrick">Sesso</p>
            <p className="font-patrick text-xl text-black uppercase font-bold">{formData.gender || "MASCHIO"}</p>
          </button>

          <button
            onClick={() => setFormData({...formData, microchip: formData.microchip === 'SÌ' ? 'NO' : 'SÌ'})}
            className={`p-3 rounded-2xl border-[3px] border-black transition-all text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${formData.microchip === 'SÌ' ? 'bg-[#98FF98]' : 'bg-gray-100'}`}
          >
            <p className="text-[10px] font-bold text-black/40 uppercase font-patrick">Microchip</p>
            <p className="font-patrick text-xl text-black uppercase font-bold">{formData.microchip || "SÌ"}</p>
          </button>
        </section>

        {/* Informazioni e Textarea (identiche) */}
        <section className="space-y-3">
          <label className="font-patrick font-bold uppercase ml-2 text-sm">Informazioni Base</label>
          <input type="text" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} className="slurpy-input uppercase font-bold" placeholder="NOME" />
          <input type="text" value={formData.nickname || ""} onChange={(e) => setFormData({...formData, nickname: e.target.value})} className="slurpy-input uppercase font-patrick" placeholder="SOPRANNOME" />
        </section>

        <section className="space-y-3">
          <label className="font-patrick font-bold uppercase ml-2 text-sm">Dove si trova</label>
          <input type="text" value={formData.city || ""} onChange={(e) => setFormData({...formData, city: e.target.value})} className="slurpy-input uppercase font-patrick" placeholder="CITTÀ" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={formData.province || ""} onChange={(e) => setFormData({...formData, province: e.target.value})} className="slurpy-input uppercase text-center font-patrick" placeholder="PROV." maxLength={2} />
            <input type="text" value={formData.region || ""} onChange={(e) => setFormData({...formData, region: e.target.value})} className="slurpy-input uppercase text-center font-patrick" placeholder="REGIONE" />
          </div>
        </section>

        <section className="space-y-3">
          <label className="font-patrick font-bold uppercase ml-2 text-sm">Dettagli Utili</label>
          <textarea value={formData.likes || ""} onChange={(e) => setFormData({...formData, likes: e.target.value})} className="slurpy-input h-20 py-3 uppercase resize-none font-patrick" placeholder="COSA GLI PIACE?" />
          <textarea value={formData.fears || ""} onChange={(e) => setFormData({...formData, fears: e.target.value})} className="slurpy-input h-20 py-3 uppercase resize-none font-patrick" placeholder="LE SUE PAURE?" />
          <textarea value={formData.health_notes || ""} onChange={(e) => setFormData({...formData, health_notes: e.target.value})} className="slurpy-input h-24 py-3 uppercase resize-none border-red-300 bg-red-50/50 font-patrick text-red-900" placeholder="NOTE SALUTE" />
        </section>

        <button onClick={handleUpdate} disabled={saving} className="btn-slurpy-primary w-full py-5 text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase italic font-bold">
          {saving && uploadingIndex === null ? "Salvataggio..." : "Salva Modifiche"}
        </button>
      </div>
    </main>
  );
}