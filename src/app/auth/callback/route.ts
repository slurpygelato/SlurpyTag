import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_description = searchParams.get('error_description')
  const error_code = searchParams.get('error')
  
  // Assicurati che l'origin non sia localhost in produzione
  // Se l'origin è localhost ma siamo su Vercel, usa l'URL di produzione
  const safeOrigin = origin.includes('localhost') 
    ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://slurpy-tag.vercel.app')
    : origin
  
  // "next" è dove vogliamo mandare l'utente (default: dashboard)
  // Leggi il parametro next dalla query string
  const next = searchParams.get('next') ?? '/dashboard'
  
  // Debug temporaneo - rimuovere dopo il test
  console.log('[Callback] next param:', next, 'full URL:', request.url)

  // Se c'è un errore nella query string, reindirizza al login
  if (error_description || error_code) {
    const errorMsg = error_description || error_code || 'Authentication error'
    return NextResponse.redirect(`${safeOrigin}/login?message=${encodeURIComponent(errorMsg)}`)
  }

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${safeOrigin}/login?message=${encodeURIComponent(error.message)}`)
      }
      
      if (data?.session) {
        // Verifica che la sessione sia stata salvata correttamente
        const { data: { session: verifySession } } = await supabase.auth.getSession()
        
        if (verifySession) {
          // Usa sempre l'origin sicuro (non localhost in produzione)
          const redirectBase = safeOrigin
          
          // PRIORITÀ 1: Se l'utente viene da "Registrati con Google" (next=/register), reindirizzalo SEMPRE a /register
          // Questo deve essere controllato PRIMA di qualsiasi altro controllo
          if (next === '/register') {
            return NextResponse.redirect(`${redirectBase}/register`)
          }
          
          // PRIORITÀ 2: Controlla se l'utente ha già registrato dei cani (solo se non viene da registrazione)
          const { data: petsData, error: petsError } = await supabase
            .from('pets')
            .select('id')
            .eq('owner_id', verifySession.user.id)
            .limit(1)
          
          // Se non ha cani o c'è un errore, reindirizza a /register (nuovo utente)
          if (petsError || !petsData || petsData.length === 0) {
            return NextResponse.redirect(`${redirectBase}/register`)
          }
          
          // PRIORITÀ 3: Se ha cani, vai alla dashboard (utente esistente)
          return NextResponse.redirect(`${redirectBase}/dashboard`)
        } else {
          // Se la sessione non è stata salvata ma l'utente viene da registrazione, prova comunque a reindirizzare a /register
          if (next === '/register') {
            return NextResponse.redirect(`${safeOrigin}/register`)
          }
          // Altrimenti reindirizza al login
          return NextResponse.redirect(`${safeOrigin}/login?message=Session not saved`)
        }
      }
      
      // Se non c'è sessione ma l'utente viene da registrazione, prova comunque a reindirizzare a /register
      if (next === '/register') {
        return NextResponse.redirect(`${safeOrigin}/register`)
      }
      return NextResponse.redirect(`${safeOrigin}/login?message=No session created`)
    } catch (err: any) {
      console.error('Callback route error:', err)
      return NextResponse.redirect(`${safeOrigin}/login?message=${encodeURIComponent(err.message || 'Authentication failed')}`)
    }
  }

  // Se non c'è codice, torna alla pagina di login
  return NextResponse.redirect(`${safeOrigin}/login?message=No authentication code provided`)
}