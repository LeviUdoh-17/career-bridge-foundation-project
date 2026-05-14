import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not add code between createServerClient and getUser()
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAdminPath    = pathname.startsWith('/admin')    || pathname.startsWith('/api/admin')
  const isAdminLogin   = pathname === '/admin/login'
  const isReviewerPath = pathname.startsWith('/reviewer') || pathname.startsWith('/api/reviewer')

  // Determine role. Fast path: JWT app_metadata (set by custom_access_token_hook).
  // Fallback: DB query for sessions that predate the hook being enabled.
  let userRole = 'candidate'

  if (user) {
    const appMeta = (user.app_metadata ?? {}) as { user_role?: string }
    if (appMeta.user_role) {
      userRole = appMeta.user_role
    } else {
      // Anon key + user session cookie → RLS lets users SELECT their own row
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()
      userRole = data?.role ?? 'candidate'
    }
  }

  // ── Admin protection ──────────────────────────────────────────────────────
  // Redirect non-admins to / (not /admin/login) — the admin area is invisible
  // to regular users and should not reveal it even exists.
  if (isAdminPath && !isAdminLogin) {
    if (!user || !['admin', 'super_admin'].includes(userRole)) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ── Reviewer protection ───────────────────────────────────────────────────
  if (isReviewerPath) {
    if (!user) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('next', '/reviewer')
      return NextResponse.redirect(url)
    }
    if (userRole !== 'reviewer') {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)',
  ],
}
