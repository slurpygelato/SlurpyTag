import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_description = searchParams.get('error_description')
  const error_code = searchParams.get('error')
  
  console.log('[Callback] Full URL:', request.url);
  console.log('[Callback] Code:', code ? 'present' : 'missing');
  console.log('[Callback] Error:', error_code || error_description || 'none');
  
  const safeOrigin = 'https://app.slurpygelato.it'

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
        console.error('[Callback] Exchange error:', error)
        return NextResponse.redirect(`${safeOrigin}/login?message=${encodeURIComponent(error.message)}`)
      }
      
      console.log('[Callback] Success! Redirecting to /auth/redirect');
      return NextResponse.redirect(`${safeOrigin}/auth/redirect`)
      
    } catch (err: any) {
      console.error('[Callback] Route error:', err)
      return NextResponse.redirect(`${safeOrigin}/login?message=${encodeURIComponent(err.message || 'Authentication failed')}`)
    }
  }

  return NextResponse.redirect(`${safeOrigin}/login?message=No authentication code provided`)
}
