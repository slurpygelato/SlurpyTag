"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Componente interno per la logica dei parametri
function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = searchParams.get("mode") || "signin";
  const [isRegistering, setIsRegistering] = useState(mode === "signup");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Aggiorna isRegistering quando cambia il mode
  useEffect(() => {
    setIsRegistering(mode === "signup");
    setMessage("");
    setIsSubmitted(false);
  }, [mode]);

  const handleGoogleLogin = async () => {
    // Salva l'intento dell'utente in localStorage PRIMA del redirect a Google
    // Questo viene usato nel callback per sapere dove reindirizzare
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_intent', isRegistering ? 'register' : 'login');
    }
    
    // Usa l'URL corrente del browser
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://slurpy-tag.vercel.app';
    
    const redirectUrl = `${baseUrl}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) setMessage(error.message);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isRegistering) {
      if (password !== confirmPassword) {
        setMessage("Le password non corrispondono!");
        setLoading(false);
        return;
      }
      
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : 'https://slurpy-tag.vercel.app/auth/callback';
      
      // Salva l'intento per la conferma email
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_intent', 'register');
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: redirectUrl,
        }
      });
      if (error) setMessage(error.message);
      else setIsSubmitted(true);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        // Controlla se l'utente ha già registrato dei cani
        const { data: petsData } = await supabase
          .from('pets')
          .select('id')
          .eq('owner_id', data.session.user.id)
          .limit(1);
        
        if (petsData && petsData.length > 0) {
          router.push("/dashboard");
        } else {
          router.push("/register");
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="slurpy-card w-full max-w-md text-center">
      <h1 className="slurpy-logo mb-10 text-6xl uppercase tracking-tight">
        {isRegistering ? "NUOVO PROFILO" : "BENTORNATO"}
      </h1>
      
      {!isSubmitted ? (
        <>
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <input 
              type="email" 
              placeholder="LA TUA EMAIL" 
              className="slurpy-input text-center !normal-case"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="PASSWORD" 
                className="slurpy-input text-center !font-sans !normal-case tracking-widest"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isRegistering && (
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="CONFERMA PASSWORD" 
                className="slurpy-input text-center !font-sans !normal-case tracking-widest"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}

            <div className="flex items-center justify-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="showPass"
                className="w-4 h-4 accent-[#FF8CB8] cursor-pointer" 
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showPass" className="font-patrick text-[#8e8e8e] cursor-pointer uppercase text-sm">
                Mostra password
              </label>
            </div>
            
            <button disabled={loading} className="btn-slurpy-primary w-full mt-6 uppercase">
              {loading ? "ATTENDI..." : isRegistering ? "CREA ACCOUNT" : "ENTRA"}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 font-patrick text-[#8e8e8e]">Oppure</span>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 p-3 rounded-2xl hover:bg-gray-50 transition-all font-patrick uppercase text-lg shadow-sm"
            >
              <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="Google" />
              {isRegistering ? "Registrati con Google" : "Accedi con Google"}
            </button>
          </div>

          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="mt-8 font-patrick text-[#8e8e8e] underline text-lg block w-full uppercase"
          >
            {isRegistering ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
          </button>
        </>
      ) : (
        <div className="py-10 animate-in fade-in zoom-in duration-500">
          <div className="text-6xl mb-6">📧</div>
          <p className="font-patrick text-2xl text-[#4a4a4a] leading-relaxed uppercase">
            Email inviata a: <br/>
            <span className="font-bold text-black !normal-case !font-sans">{email}</span>
          </p>
          <p className="font-patrick text-xl mt-4 text-[#8e8e8e] uppercase">
            Controlla la posta per attivare il profilo!
          </p>
        </div>
      )}

      {message && !isSubmitted && (
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-2xl font-patrick text-lg uppercase text-red-500">
          {message}
        </div>
      )}
    </div>
  );
}

// Esportiamo la pagina avvolgendola in Suspense
export default function AuthPage() {
  return (
    <main className="min-h-screen p-6 flex items-center justify-center bg-[#FDF6EC]">
      <Suspense fallback={
        <div className="font-patrick text-2xl animate-pulse uppercase">Caricamento...</div>
      }>
        <AuthForm />
      </Suspense>
    </main>
  );
}
