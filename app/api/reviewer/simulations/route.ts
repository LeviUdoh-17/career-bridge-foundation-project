import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { requireReviewer } from '@/lib/auth/permissions'

export async function GET() {
  let ctx
  try {
    ctx = await requireReviewer()
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: discRows } = await supabaseServer
    .from('reviewer_disciplines')
    .select('discipline')
    .eq('reviewer_id', ctx.userId)

  const disciplines = (discRows ?? []).map(r => r.discipline)

  if (disciplines.length === 0) {
    return NextResponse.json({ simulations: [], disciplines: [] })
  }

  const { data: simulations, error } = await supabaseServer
    .from('simulations')
    .select('id, slug, title, company, industry, discipline, difficulty, cert_status, updated_at, prompts')
    .or(`discipline.is.null,discipline.in.(${disciplines.join(',')})`)
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ simulations: simulations ?? [], disciplines })
}
