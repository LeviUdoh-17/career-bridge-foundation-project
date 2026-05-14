import React from 'react'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { getCurrentUserRole } from '@/lib/auth/permissions'
import { ArrowLeft, CheckCircle2, Clock, XCircle, BookOpen, Layers } from 'lucide-react'
import { CertifyForm } from './_certify-form'

const CERT_STYLE = {
  certified: { label: 'Certified', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: CheckCircle2 },
  rejected:  { label: 'Rejected',  bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', icon: XCircle },
  pending:   { label: 'Pending',   bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: Clock },
}

type Prompt = {
  id: string
  type: string
  title: string
  question: string
  guidance: string[]
  minWords: number
}

export default async function ReviewerSimPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ctx = await getCurrentUserRole()
  if (!ctx || ctx.role !== 'reviewer') redirect('/reviewer/login')

  const { data: sim } = await supabaseServer
    .from('simulations')
    .select('*')
    .eq('slug', slug)
    .single()

  console.log("Simulations: ", sim)
  if (!sim) notFound()

  // Verify this reviewer covers the simulation's discipline
  if (sim.discipline) {
    const { data: hasDisc } = await supabaseServer
      .from('reviewer_disciplines')
      .select('discipline')
      .eq('reviewer_id', ctx.userId)
      .eq('discipline', sim.discipline)
      .maybeSingle()

    if (!hasDisc) redirect('/reviewer')
  }

  // Fetch prompts from simulation_prompts table (same source as admin editor)
  const { data: promptRows, error: promptsError } = await supabaseServer
    .from('simulation_prompts')
    .select('*')
    .eq('simulation_id', sim.id)
    .order('display_order', { ascending: true })

  if (promptsError) console.error('[reviewer] prompts error:', promptsError.message)

  const prompts: Prompt[] = (promptRows ?? []).map((p: Record<string, unknown>) => ({
    id: String(p.id),
    type: String(p.type ?? ''),
    title: String(p.title ?? ''),
    question: String(p.question ?? ''),
    guidance: Array.isArray(p.guidance) ? p.guidance as string[] : [],
    minWords: Number(p.min_words ?? 0),
  }))

  // Active rubric
  const { data: rubrics } = await supabaseServer
    .from('rubrics')
    .select('id, version, system_prompt, model, max_score')
    .eq('simulation_slug', slug)
    .eq('is_active', true)
    .limit(1)

  const rubric = rubrics?.[0] ?? null
  const cert = CERT_STYLE[sim.cert_status as keyof typeof CERT_STYLE] ?? CERT_STYLE.pending
  const CertIcon = cert.icon

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/reviewer"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: 'rgba(0,51,89,0.5)' }}
      >
        <ArrowLeft size={14} />
        Back to queue
      </Link>

      {/* Title block */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl tracking-tight" style={{ color: '#003359' }}>
            {sim.title || sim.slug}
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            {[sim.company, sim.industry, sim.discipline, sim.difficulty].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0"
          style={{ backgroundColor: cert.bg, color: cert.color, border: `1px solid ${cert.border}` }}
        >
          <CertIcon size={12} />
          {cert.label}
        </span>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Left column: overview + prompts */}
        <div className="space-y-6">
          {/* Brief */}
          {(sim.brief_short || sim.brief_full) && (
            <section
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#fff', border: '1px solid #d5dce8' }}
            >
              <div
                className="px-5 py-3.5 flex items-center gap-2"
                style={{ borderBottom: '1px solid #d5dce8' }}
              >
                <BookOpen size={14} style={{ color: '#0d9488' }} />
                <span className="text-sm font-semibold" style={{ color: '#003359' }}>
                  Brief
                </span>
              </div>
              <div className="px-5 py-5 space-y-3">
                {sim.brief_short && (
                  <p className="text-sm font-medium text-slate-800">{sim.brief_short}</p>
                )}
                {sim.brief_full && (
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                    {sim.brief_full}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Prompts */}
          <section
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: '#fff', border: '1px solid #d5dce8' }}
          >
            <div
              className="px-5 py-3.5 flex items-center gap-2"
              style={{ borderBottom: '1px solid #d5dce8' }}
            >
              <Layers size={14} style={{ color: '#0d9488' }} />
              <span className="text-sm font-semibold" style={{ color: '#003359' }}>
                Prompts
              </span>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(0,51,89,0.06)', color: 'rgba(0,51,89,0.5)' }}
              >
                {prompts.length}
              </span>
            </div>

            {prompts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-500">No prompts configured yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {prompts.map((p, i) => (
                  <div key={p.id ?? i} className="px-5 py-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ backgroundColor: 'rgba(0,51,89,0.08)', color: '#003359' }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 space-y-1.5">
                        <div className="font-semibold text-sm" style={{ color: '#003359' }}>
                          {p.title}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700">{p.question}</p>
                        {p.guidance && p.guidance.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {p.guidance.map((g, gi) => (
                              <li key={gi} className="flex items-start gap-2 text-xs text-slate-500">
                                <span className="mt-0.5 text-teal">•</span>
                                {g}
                              </li>
                            ))}
                          </ul>
                        )}
                        {p.minWords != null && (
                          <p className="text-xs text-slate-400">Min. {p.minWords} words</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column: rubric + certify */}
        <div className="space-y-6">
          {/* Rubric */}
          <section
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: '#fff', border: '1px solid #d5dce8' }}
          >
            <div
              className="px-5 py-3.5"
              style={{ borderBottom: '1px solid #d5dce8' }}
            >
              <span className="text-sm font-semibold" style={{ color: '#003359' }}>
                Evaluation Rubric
              </span>
            </div>
            {!rubric ? (
              <p className="px-5 py-6 text-sm text-slate-500">No rubric configured yet.</p>
            ) : (
              <div className="px-5 py-5 space-y-4">
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>
                    <span className="font-semibold text-slate-700">Model:</span> {rubric.model}
                  </span>
                  <span>
                    <span className="font-semibold text-slate-700">Max score:</span> {rubric.max_score}
                  </span>
                  <span>
                    <span className="font-semibold text-slate-700">v{rubric.version}</span>
                  </span>
                </div>
                <div
                  className="rounded-lg p-3 text-xs font-mono leading-relaxed text-slate-700 overflow-auto max-h-80"
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  {rubric.system_prompt}
                </div>
              </div>
            )}
          </section>

          {/* Certification form */}
          <CertifyForm
            slug={slug}
            currentStatus={sim.cert_status ?? 'pending'}
            currentNotes={sim.cert_notes ?? ''}
          />
        </div>
      </div>
    </div>
  )
}
