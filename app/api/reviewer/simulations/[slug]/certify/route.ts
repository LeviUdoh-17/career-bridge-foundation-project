import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireReviewer } from '@/lib/auth/permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let ctx
  try {
    ctx = await requireReviewer()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { status: 'certified' | 'rejected'; notes?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!['certified', 'rejected'].includes(body.status)) {
    return NextResponse.json({ error: 'status must be certified or rejected' }, { status: 400 })
  }

  // Verify reviewer is assigned to this simulation's discipline
  const { data: sim } = await supabaseServer
    .from('simulations')
    .select('discipline')
    .eq('slug', slug)
    .single()

  if (!sim) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (sim.discipline) {
    const { data: hasDisc } = await supabaseServer
      .from('reviewer_disciplines')
      .select('discipline')
      .eq('reviewer_id', ctx.userId)
      .eq('discipline', sim.discipline)
      .maybeSingle()

    if (!hasDisc) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { error } = await supabaseServer
    .from('simulations')
    .update({
      cert_status: body.status,
      cert_notes: body.notes ?? null,
      certified_by: ctx.userId,
      certified_at: new Date().toISOString(),
    })
    .eq('slug', slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, status: body.status })
}
