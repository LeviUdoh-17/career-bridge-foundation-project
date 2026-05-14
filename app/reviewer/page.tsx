import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { getCurrentUserRole } from '@/lib/auth/permissions'
import { CheckCircle2, Clock, XCircle, FileText, ChevronRight } from 'lucide-react'

const CERT_STYLE = {
  certified: { label: 'Certified',  bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: CheckCircle2 },
  rejected:  { label: 'Rejected',   bg: '#fff1f2', color: '#e11d48', border: '#fecdd3', icon: XCircle },
  pending:   { label: 'Pending',    bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: Clock },
}

const DIFFICULTY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Foundation:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Practitioner: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Advanced:     { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
}

type SimRow = {
  slug: string
  title: string | null
  company: string | null
  industry: string | null
  discipline: string | null
  difficulty: string | null
  cert_status?: string | null
  updated_at: string | null
  prompts: unknown[] | null
}

export default async function ReviewerPage() {
  const ctx = await getCurrentUserRole()
  if (!ctx || ctx.role !== 'reviewer') redirect('/reviewer/login')

  const { data: discRows } = await supabaseServer
    .from('reviewer_disciplines')
    .select('discipline')
    .eq('reviewer_id', ctx.userId)

  const disciplines = (discRows ?? []).map(r => r.discipline)

  let simulations: SimRow[] = []
  if (disciplines.length > 0) {
    // Fetch all simulations and filter in JS.
    // This avoids PostgREST .or() syntax issues and gracefully handles the case
    // where the discipline/cert_status columns haven't been applied yet.
    // Unclassified sims (null discipline) are visible to all reviewers until tagged.
    const { data, error } = await supabaseServer
      .from('simulations')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) console.error('[reviewer] simulations query error:', error.message)

    simulations = ((data ?? []) as SimRow[]).filter(
      s => !s.discipline || disciplines.includes(s.discipline)
    )
  }

  const certified = simulations.filter(s => s.cert_status === 'certified').length
  const pending   = simulations.filter(s => !s.cert_status || s.cert_status === 'pending').length
  const rejected  = simulations.filter(s => s.cert_status === 'rejected').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl tracking-tight" style={{ color: '#003359' }}>
          Simulation Review Queue
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,51,89,0.45)' }}>
          {disciplines.length > 0
            ? `Reviewing: ${disciplines.join(' · ')}`
            : 'No disciplines assigned — contact an admin.'}
        </p>
      </div>

      {/* Stats */}
      {simulations.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { count: pending,    ...CERT_STYLE.pending },
            { count: certified,  ...CERT_STYLE.certified },
            { count: rejected,   ...CERT_STYLE.rejected },
          ].map(({ label, count, bg, color, border, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl px-5 py-4 flex items-center gap-3"
              style={{ backgroundColor: '#fff', border: '1px solid #d5dce8' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#003359' }}>{count}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simulation list */}
      {disciplines.length === 0 ? (
        <div
          className="rounded-xl px-6 py-12 text-center"
          style={{ backgroundColor: '#fff', border: '1px solid #d5dce8' }}
        >
          <p className="text-sm text-slate-500">
            You have no disciplines assigned. Contact an admin to get access.
          </p>
        </div>
      ) : simulations.length === 0 ? (
        <div
          className="rounded-xl px-6 py-12 text-center"
          style={{ backgroundColor: '#fff', border: '1px solid #d5dce8' }}
        >
          <p className="text-sm text-slate-500">
            No simulations found for your disciplines yet.
          </p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: '#fff', border: '1px solid #d5dce8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          {simulations.map(sim => {
            const cert = CERT_STYLE[(sim.cert_status ?? 'pending') as keyof typeof CERT_STYLE] ?? CERT_STYLE.pending
            const diff = DIFFICULTY_STYLE[sim.difficulty ?? ''] ?? { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' }
            const CertIcon = cert.icon
            const promptCount = Array.isArray(sim.prompts) ? sim.prompts.length : 0

            return (
              <Link
                key={sim.slug}
                href={`/reviewer/simulations/${sim.slug}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                style={{ borderBottom: '1px solid #f3f4f6' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(0,51,89,0.05)' }}
                >
                  <FileText size={15} style={{ color: 'rgba(0,51,89,0.35)' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate" style={{ color: '#003359' }}>
                    {sim.title || sim.slug}
                  </div>
                  <div className="text-xs mt-0.5 text-slate-500 truncate">
                    {[sim.company, sim.industry, sim.discipline].filter(Boolean).join(' · ')}
                    {promptCount > 0 && ` · ${promptCount} prompt${promptCount > 1 ? 's' : ''}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {sim.difficulty && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}
                    >
                      {sim.difficulty}
                    </span>
                  )}
                  <span
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: cert.bg, color: cert.color, border: `1px solid ${cert.border}` }}
                  >
                    <CertIcon size={11} />
                    {cert.label}
                  </span>
                  <ChevronRight size={14} style={{ color: 'rgba(0,51,89,0.2)' }} />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
