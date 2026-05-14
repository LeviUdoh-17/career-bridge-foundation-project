import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/permissions'

async function guardAndResolve(request: NextRequest, userId: string) {
  let ctx
  try {
    ctx = await requireAdmin()
  } catch {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  if (ctx.role !== 'super_admin' && !ctx.permissions.canManageUsers) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  // Prevent modifying or deleting a super_admin
  const { data: existing } = await supabaseServer
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (existing?.role === 'super_admin') {
    return { error: NextResponse.json({ error: 'Cannot modify super_admin' }, { status: 400 }) }
  }

  return { ctx, existing }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const guard = await guardAndResolve(request, userId)
  if (guard.error) return guard.error

  let body: {
    role?: string
    permissions?: Record<string, boolean>
    disciplines?: string[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.role && body.role !== 'super_admin') updates.role = body.role
  if (body.permissions) updates.permissions = body.permissions

  const { data, error } = await supabaseServer
    .from('user_roles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update disciplines if provided (only relevant for reviewers)
  if (Array.isArray(body.disciplines)) {
    await supabaseServer
      .from('reviewer_disciplines')
      .delete()
      .eq('reviewer_id', userId)

    if (body.disciplines.length > 0) {
      await supabaseServer
        .from('reviewer_disciplines')
        .insert(body.disciplines.map(d => ({ reviewer_id: userId, discipline: d })))
    }
  }

  return NextResponse.json({ member: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const guard = await guardAndResolve(request, userId)
  if (guard.error) return guard.error

  // Remove disciplines first (FK)
  await supabaseServer
    .from('reviewer_disciplines')
    .delete()
    .eq('reviewer_id', userId)

  const { error } = await supabaseServer
    .from('user_roles')
    .delete()
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
