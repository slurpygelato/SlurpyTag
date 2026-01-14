"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface Owner {
  name: string;
  phone: string;
  email: string;
}

interface PetData {
  name: string;
  nickname: string;
  city: string;
  province: string;
  region: string;
  gender: string;
  birthDate: string;
  microchip: string;
  likes: string;
  fears: string;
  healthNotes: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const [owners, setOwners] = useState<Owner[]>([{ name: "", phone: "", email: "" }]);
  const [petData, setPetData] = useState<PetData>({
    name: "", nickname: "", city: "", province: "", region: "",
    gender: "", birthDate: "", microchip: "",
    likes: "", fears: "", healthNotes: ""
  });
  const [photos, setPhotos] = useState<{preview: string, file: File}[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?mode=signin");
      } else {
        setLoading(false);
        setMounted(true);
      }
    };
    checkUser();
  }, [router]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "SELEZIONA DATA";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newPhoto = { preview: URL.createObjectURL(file), file: file };
      if (photos.length < 3) setPhotos([...photos, newPhoto]);
    }
    if (e.target) e.target.value = "";
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].preview);
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const updateOwner = (index: number, field: keyof Owner, value: string) => {
    const newOwners = [...owners];
    newOwners[index][field] = value;
    setOwners(newOwners);
  };

  const handleFinalSubmit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setLoading(true);

      // --- CARICAMENTO MULTI-FOTO ---
      const uploadedUrls: string[] = [];

      for (const photo of photos) {
        const file = photo.file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Errore upload:", uploadError);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('pet-photos')
            .getPublicUrl(filePath);
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      const generatedSlug = `${petData.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

      // 1. Salvataggio Cane con i 3 slot foto
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .insert([{
          owner_id: session.user.id,
          name: petData.name,
          slug: generatedSlug,
          nickname: petData.nickname,
          city: petData.city,
          province: petData.province,
          region: petData.region,
          gender: petData.gender.toUpperCase(), 
          birth_date: petData.birthDate,
          microchip: petData.microchip,
          likes: petData.likes,
          fears: petData.fears,
          health_notes: petData.healthNotes,
          image_url: uploadedUrls[0] || null,   // Foto 1
          image_url_2: uploadedUrls[1] || null, // Foto 2
          image_url_3: uploadedUrls[2] || null  // Foto 3
        }])
        .select()
        .single();

      if (petError) throw petError;

      // 2. Salvataggio Proprietari
      const ownersToSave = owners.map(o => ({
        pet_id: pet.id,
        name: o.name,
        phone: o.phone,
        email: o.email
      }));

      const { error: ownerError } = await supabase
        .from('family_members')
        .insert(ownersToSave);

      if (ownerError) throw ownerError;

      router.push("/dashboard");
    } catch (error: any) {
      alert("Errore: " + error.message);
      setLoading(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
        <p className="font-patrick text-2xl animate-pulse uppercase text-black">Caricamento...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 flex flex-col items-center bg-[#FDF6EC]">
      <div className="w-full max-w-xl">
        <header className="mb-6 sm:mb-10 text-center">
          <h1 className="slurpy-logo">Slurpy Tag</h1>
          <div className="flex justify-center gap-1 sm:gap-2 mt-4">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`h-2 sm:h-3 w-6 sm:w-8 rounded-full transition-all ${step >= i ? 'bg-[#FF8CB8]' : 'bg-gray-200'}`} />
            ))}
          </div>
        </header>

        <div className="slurpy-card">
          {step === 0 && (
            <div className="animate-in fade-in zoom-in duration-500 space-y-8 text-center py-4">
              <div className="text-7xl">🐾</div>
              <h2 className="slurpy-h2 italic uppercase">Benvenuto!</h2>
              <p className="font-patrick text-2xl uppercase text-[#8e8e8e]">Creiamo la pagina del tuo pelosetto in un attimo.</p>
              <button onClick={() => setStep(1)} className="btn-slurpy-primary uppercase w-full py-6 text-2xl">COMINCIAMO!</button>
            </div>
          )}

          {step === 1 && (
            <div className="animate-in slide-in-from-right duration-500 space-y-4">
              <h2 className="slurpy-h2 italic uppercase text-center">Contatti</h2>
              {owners.map((owner, i) => (
                <div key={i} className="space-y-3 p-5 bg-white/40 rounded-[30px] border-2 border-black/5">
                  <input type="text" placeholder="IL TUO NOME" className="slurpy-input text-center uppercase" value={owner.name} onChange={(e) => updateOwner(i, 'name', e.target.value)} />
                  <div className="slurpy-input bg-white flex items-center justify-center">
                    <PhoneInput defaultCountry="IT" placeholder="CELLULARE" value={owner.phone} onChange={(v) => updateOwner(i, 'phone', v || "")} className="w-full flex" />
                  </div>
                  <input type="email" placeholder="EMAIL" className="slurpy-input text-center !normal-case" value={owner.email} onChange={(e) => updateOwner(i, 'email', e.target.value)} />
                </div>
              ))}
              <button onClick={() => setOwners([...owners, {name:"", phone:"", email:""}])} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 font-bold uppercase text-[10px] font-patrick">+ Aggiungi proprietario</button>
              <div className="pt-4 space-y-3">
                <button onClick={() => setStep(2)} className="btn-slurpy-primary uppercase">Continua</button>
                <button onClick={() => setStep(0)} className="btn-slurpy-secondary uppercase">Indietro</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right duration-500 space-y-4">
              <h2 className="slurpy-h2 italic uppercase text-center">Dati Base</h2>
              <input type="text" placeholder="NOME" className="slurpy-input text-center uppercase" value={petData.name} onChange={(e) => setPetData({...petData, name: e.target.value})} />
              <input type="text" placeholder="SOPRANNOME" className="slurpy-input text-center uppercase" value={petData.nickname} onChange={(e) => setPetData({...petData, nickname: e.target.value})} />
              <input type="text" placeholder="CITTÀ" className="slurpy-input text-center uppercase" value={petData.city} onChange={(e) => setPetData({...petData, city: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="PROV." maxLength={2} className="slurpy-input text-center uppercase" value={petData.province} onChange={(e) => setPetData({...petData, province: e.target.value})} />
                <input type="text" placeholder="REGIONE" className="slurpy-input text-center uppercase" value={petData.region} onChange={(e) => setPetData({...petData, region: e.target.value})} />
              </div>
              <div className="pt-4 space-y-3">
                <button onClick={() => setStep(3)} className="btn-slurpy-primary uppercase">Avanti</button>
                <button onClick={() => setStep(1)} className="btn-slurpy-secondary uppercase">Indietro</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in slide-in-from-right duration-500 space-y-6">
              <h2 className="slurpy-h2 italic uppercase text-center">Identità</h2>
              <div className="space-y-2">
                <span className="text-sm font-bold text-gray-400 uppercase font-patrick text-center block">Sesso</span>
                <div className="flex gap-3">
                  <button onClick={() => setPetData({...petData, gender: 'Maschio'})} className={`slurpy-toggle-btn ${petData.gender === 'Maschio' ? 'slurpy-toggle-active' : 'slurpy-toggle-inactive'}`}>Maschio</button>
                  <button onClick={() => setPetData({...petData, gender: 'Femmina'})} className={`slurpy-toggle-btn ${petData.gender === 'Femmina' ? 'slurpy-toggle-active' : 'slurpy-toggle-inactive'}`}>Femmina</button>
                </div>
              </div>
              <div className="space-y-2 text-center">
                <span className="text-sm font-bold text-gray-400 uppercase font-patrick block">Data di Nascita</span>
                <div onClick={() => dateInputRef.current?.showPicker()} className="slurpy-input flex items-center justify-center cursor-pointer uppercase">
                  {formatDate(petData.birthDate)}
                </div>
                <input type="date" ref={dateInputRef} className="sr-only" onChange={(e) => setPetData({...petData, birthDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-bold text-gray-400 uppercase font-patrick text-center block">Microchip</span>
                <div className="flex gap-3">
                  <button onClick={() => setPetData({...petData, microchip: 'Sì'})} className={`slurpy-toggle-btn ${petData.microchip === 'Sì' ? 'slurpy-toggle-active' : 'slurpy-toggle-inactive'}`}>Sì</button>
                  <button onClick={() => setPetData({...petData, microchip: 'No'})} className={`slurpy-toggle-btn ${petData.microchip === 'No' ? 'slurpy-toggle-active' : 'slurpy-toggle-inactive'}`}>No</button>
                </div>
              </div>
              <div className="pt-4 space-y-3">
                <button onClick={() => setStep(4)} className="btn-slurpy-primary uppercase">Avanti</button>
                <button onClick={() => setStep(2)} className="btn-slurpy-secondary uppercase">Indietro</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in slide-in-from-right duration-500 space-y-4">
              <h2 className="slurpy-h2 italic uppercase text-center">Curiosità</h2>
              <textarea placeholder="COSA GLI PIACE?" className="slurpy-input h-24 py-4 resize-none text-center uppercase" value={petData.likes} onChange={(e) => setPetData({...petData, likes: e.target.value})} />
              <textarea placeholder="LE SUE PAURE?" className="slurpy-input h-24 py-4 resize-none text-center uppercase" value={petData.fears} onChange={(e) => setPetData({...petData, fears: e.target.value})} />
              <textarea placeholder="NOTE SALUTE" className="slurpy-input h-24 py-4 resize-none border-red-100 bg-red-50/20 text-center uppercase" value={petData.healthNotes} onChange={(e) => setPetData({...petData, healthNotes: e.target.value})} />
              <div className="pt-4 space-y-3">
                <button onClick={() => setStep(5)} className="btn-slurpy-primary uppercase">Avanti</button>
                <button onClick={() => setStep(3)} className="btn-slurpy-secondary uppercase">Indietro</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="animate-in zoom-in duration-500 space-y-6 text-center">
              <h2 className="slurpy-h2 italic uppercase">Foto 📸</h2>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoChange} />
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} onClick={() => photos.length === i && fileInputRef.current?.click()} className="aspect-square rounded-[25px] border-2 border-dashed border-black/10 bg-white flex items-center justify-center overflow-hidden cursor-pointer relative shadow-sm">
                    {photos[i] ? <img src={photos[i].preview} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl text-gray-200 font-bold">+</span>}
                    {photos[i] && <button onClick={(e) => {e.stopPropagation(); removePhoto(i);}} className="absolute top-1 right-1 bg-black text-white rounded-full w-5 h-5 text-[8px] flex items-center justify-center">✕</button>}
                  </div>
                ))}
              </div>
              <div className="pt-4 space-y-3">
                <button onClick={() => setStep(6)} className="btn-slurpy-primary uppercase">Riepilogo</button>
                <button onClick={() => setStep(4)} className="btn-slurpy-secondary uppercase">Indietro</button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in zoom-in duration-500 space-y-6 text-center">
              <h2 className="slurpy-h2 italic uppercase">Riepilogo</h2>
              <div className="p-6 bg-[#FDF6EC] rounded-[40px] border-[3px] border-black space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {photos.length > 0 && (
                  <div className="flex justify-center gap-2">
                    {photos.map((p, i) => (
                      <img key={i} src={p.preview} className="w-16 h-16 rounded-xl border-2 border-black object-cover" />
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-4xl font-bold uppercase font-patrick">🐶 {petData.name}</p>
                </div>
                <div className="grid grid-cols-1 gap-1 text-lg font-patrick uppercase text-left border-t-2 border-dashed border-black/10 pt-4">
                  <p>📍 {petData.city} ({petData.province})</p>
                  <p>🎂 {formatDate(petData.birthDate)}</p>
                  <p>⚧️ {petData.gender} | 🆔 CHIP: {petData.microchip}</p>
                  <p>📞 {owners[0].phone}</p>
                </div>
                <div className="text-left font-patrick uppercase text-xs space-y-1 border-t-2 border-dashed border-black/10 pt-4">
                  <p><span className="text-[#FF8CB8] font-bold">Loves:</span> {petData.likes || "---"}</p>
                  <p><span className="text-blue-400 font-bold">Fears:</span> {petData.fears || "---"}</p>
                  <p><span className="text-red-400 font-bold">Health:</span> {petData.healthNotes || "---"}</p>
                </div>
              </div>
              <div className="pt-4 space-y-3">
                <button onClick={handleFinalSubmit} className="btn-slurpy-primary italic uppercase text-2xl py-6 w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">Registra Ora! 🚀</button>
                <button onClick={() => setStep(5)} className="btn-slurpy-secondary uppercase w-full">Modifica</button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .PhoneInputInput { 
          font-family: var(--font-patrick);
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