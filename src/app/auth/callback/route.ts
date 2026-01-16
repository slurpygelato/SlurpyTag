import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_description = searchParams.get('error_description')
  
  // "next" è dove vogliamo mandare l'utente (default: dashboard)
  const next = searchParams.get('next') ?? '/dashboard'

  // Se c'è un errore nella query string, reindirizza al login
  if (error_description) {
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(error_description)}`)
  }

  if (code) {
    const cookieStore = await cookies() // Aggiunto await per Next.js 15
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
    
    if (!error && data.session) {
      // Se l'utente viene dalla conferma email e deve andare a /register, reindirizzalo lì
      if (next === '/register') {
        return NextResponse.redirect(`${origin}${next}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    // Se c'è un errore, torna alla pagina di login con un messaggio
    const errorMessage = error?.message || 'Could not authenticate user'
    return NextResponse.redirect(`${origin}/login?message=${encodeURIComponent(errorMessage)}`)
  }

  // Se non c'è codice, torna alla pagina di login
  return NextResponse.redirect(`${origin}/login?message=No authentication code provided`)
}