import React from 'react'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/permissions'
import { TeamManager } from './_team-manager'

export const metadata = { title: 'Team — Admin' }

export default async function TeamPage() {
  let ctx
  try {
    ctx = await requireAdmin()
  } catch {
    redirect('/')
  }

  if (ctx.role !== 'super_admin' && !ctx.permissions.canManageUsers) {
    redirect('/admin')
  }

  const { data: members } = await supabaseServer
    .from('user_roles')
    .select('id, user_id, email, role, permissions, created_at')
    .neq('role', 'candidate')
    .order('created_at', { ascending: false })

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

  return (
    <TeamManager
      initialMembers={enriched}
      isSuperAdmin={ctx.role === 'super_admin'}
    />
  )
}
