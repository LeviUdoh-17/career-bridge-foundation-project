import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/permissions'

export async function GET() {
  let ctx
  try {
    ctx = await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (ctx.role !== 'super_admin' && !ctx.permissions.canManageUsers) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: members, error } = await supabaseServer
    .from('user_roles')
    .select('id, user_id, email, role, permissions, granted_by, created_at')
    .neq('role', 'candidate')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Attach disciplines for reviewer members
  const reviewerIds = (members ?? [])
    .filter(m => m.role === 'reviewer')
    .map(m => m.user_id)

  let disciplineMap: Record<string, string[]> = {}
  if (reviewerIds.length > 0) {
    const { data: discs } = await supabaseServer
      .from('reviewer_disciplines')
      .select('reviewer_id, discipline')
      .in('reviewer_id', reviewerIds)
    for (const d of discs ?? []) {
      if (!disciplineMap[d.reviewer_id]) disciplineMap[d.reviewer_id] = []
      disciplineMap[d.reviewer_id].push(d.discipline)
    }
  }

  const enriched = (members ?? []).map(m => ({
    ...m,
    disciplines: disciplineMap[m.user_id] ?? [],
  }))

  return NextResponse.json({ members: enriched })
}

export async function POST(request: NextRequest) {
  let ctx
  try {
    ctx = await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (ctx.role !== 'super_admin' && !ctx.permissions.canManageUsers) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: {
    email: string
    role: string
    permissions?: Record<string, boolean>
    disciplines?: string[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, role, permissions, disciplines } = body

  if (!email || !role) {
    return NextResponse.json({ error: 'email and role are required' }, { status: 400 })
  }
  if (!['admin', 'reviewer'].includes(role)) {
    return NextResponse.json({ error: 'role must be admin or reviewer' }, { status: 400 })
  }

  // Resolve the target user from Supabase Auth
  const { data: { users }, error: usersErr } = await supabaseServer.auth.admin.listUsers()
  if (usersErr) return NextResponse.json({ error: usersErr.message }, { status: 500 })

  const target = users.find(u => u.email === email)
  if (!target) {
    return NextResponse.json(
      { error: `No account found for ${email}. The user must sign up first.` },
      { status: 404 }
    )
  }

  const defaultPerms = role === 'admin'
    ? { canManageSimulations: true, canManageUsers: false, canViewAnalytics: true, canExportData: false }
    : {}

  const { data: member, error } = await supabaseServer
    .from('user_roles')
    .upsert(
      {
        user_id: target.id,
        email: target.email,
        role,
        permissions: permissions ?? defaultPerms,
        granted_by: ctx.userId,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Set disciplines for reviewers
  if (role === 'reviewer' && Array.isArray(disciplines)) {
    await supabaseServer
      .from('reviewer_disciplines')
      .delete()
      .eq('reviewer_id', target.id)

    if (disciplines.length > 0) {
      await supabaseServer
        .from('reviewer_disciplines')
        .insert(disciplines.map(d => ({ reviewer_id: target.id, discipline: d })))
    }
  }

  return NextResponse.json({ member }, { status: 201 })
}
