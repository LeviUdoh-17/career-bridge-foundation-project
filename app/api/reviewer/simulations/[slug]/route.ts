import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireReviewer } from '@/lib/auth/permissions'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let ctx
  try {
    ctx = await requireReviewer()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: sim, error } = await supabaseServer
    .from('simulations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !sim) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Verify reviewer is assigned to this simulation's discipline
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

  // Fetch the active rubric for this simulation
  const { data: rubrics } = await supabaseServer
    .from('rubrics')
    .select('id, version, system_prompt, model, max_score')
    .eq('simulation_slug', slug)
    .eq('is_active', true)
    .limit(1)

  return NextResponse.json({ simulation: sim, rubric: rubrics?.[0] ?? null })
}
