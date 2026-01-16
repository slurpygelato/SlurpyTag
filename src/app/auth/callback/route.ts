import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_description = searchParams.get('error_description')
  const error_code = searchParams.get('error')
  
  // Debug: log tutti i parametri ricevuti
  console.log('[Callback] Full URL:', request.url);
  console.log('[Callback] Code:', code ? 'present' : 'missing');
  console.log('[Callback] Error:', error_code || error_description || 'none');
  console.log('[Callback] Origin:', origin);
  console.log('[Callback] All params:', Object.fromEntries(searchParams.entries()));
  
  // Determina l'URL base sicuro (non localhost in produzione)
  const safeOrigin = origin.includes('localhost') 
    ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://slurpy-tag.vercel.app')
    : origin

  // Se c'è un errore nella query string, reindirizza al login
  if (error_description || error_code) {
    const errorMsg = error_description || error_code || 'Authentication error'
    console.error('[Callback] Auth error:', errorMsg);
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

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${safeOrigin}/login?message=${encodeURIComponent(error.message)}`)
      }
      
      // Sessione creata con successo - reindirizza alla pagina client che gestisce il routing
      // La pagina /auth/redirect leggerà l'intento da localStorage e reindirizzerà di conseguenza
      return NextResponse.redirect(`${safeOrigin}/auth/redirect`)
      
    } catch (err: any) {
      console.error('Callback route error:', err)
      return NextResponse.redirect(`${safeOrigin}/login?message=${encodeURIComponent(err.message || 'Authentication failed')}`)
    }
  }

  // Se non c'è codice, torna alla pagina di login
  return NextResponse.redirect(`${safeOrigin}/login?message=No authentication code provided`)
}
