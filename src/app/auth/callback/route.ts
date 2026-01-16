import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_description = searchParams.get('error_description')
  const error_code = searchParams.get('error')
  
  // "next" è dove vogliamo mandare l'utente (default: dashboard)
  const next = searchParams.get('next') ?? '/dashboard'

  // Se c'è un errore nella query string, reindirizza al login
  if (error_description || error_code) {
    const errorMsg = error_description || error_code || 'Authentication error'
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(errorMsg)}`)
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
        return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(error.message)}`)
      }
      
      if (data?.session) {
        // Verifica che la sessione sia stata salvata correttamente
        const { data: { session: verifySession } } = await supabase.auth.getSession()
        
        if (verifySession) {
          // Se l'utente viene dalla conferma email e deve andare a /register, reindirizzalo lì
          if (next === '/register') {
            return NextResponse.redirect(`${origin}${next}`)
          }
          // Redirect alla dashboard o alla pagina richiesta
          return NextResponse.redirect(`${origin}${next}`)
        } else {
          return NextResponse.redirect(`${origin}/login?message=Session not saved`)
        }
      }
      
      return NextResponse.redirect(`${origin}/login?message=No session created`)
    } catch (err: any) {
      console.error('Callback route error:', err)
      return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(err.message || 'Authentication failed')}`)
    }
  }

  // Se non c'è codice, torna alla pagina di login
  return NextResponse.redirect(`${origin}/login?message=No authentication code provided`)
}