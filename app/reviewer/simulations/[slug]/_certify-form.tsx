'use client'

import React, { useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

type CertStatus = 'pending' | 'certified' | 'rejected'

export function CertifyForm({
  slug,
  currentStatus,
  currentNotes,
}: {
  slug: string
  currentStatus: CertStatus
  currentNotes: string
}) {
  const router = useRouter()
  const [notes, setNotes] = useState(currentNotes)
  const [submitting, setSubmitting] = useState<CertStatus | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<CertStatus | null>(null)

  async function certify(status: 'certified' | 'rejected') {
    setSubmitting(status)
    setError('')
    setSuccess(null)

    const res = await fetch(`/api/reviewer/simulations/${slug}/certify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes: notes.trim() || undefined }),
    })

    const json = await res.json()
    setSubmitting(null)

    if (!res.ok) {
      setError(json.error ?? 'Failed to submit')
      return
    }

    setSuccess(status)
    router.refresh()
  }

  async function reset() {
    setSubmitting('pending')
    setError('')
    setSuccess(null)

    const res = await fetch(`/api/reviewer/simulations/${slug}/certify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'pending', notes: '' }),
    })

    setSubmitting(null)
    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? 'Failed')
      return
    }

    setSuccess('pending')
    setNotes('')
    router.refresh()
  }

  const isBusy = !!submitting
  const displayStatus = success ?? currentStatus

  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#fff', border: '1px solid #d5dce8' }}
    >
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #d5dce8' }}>
        <span className="text-sm font-semibold" style={{ color: '#003359' }}>
          Certification Decision
        </span>
      </div>

      <div className="px-5 py-5 space-y-4">
        {displayStatus !== 'pending' && (
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2.5"
            style={{
              backgroundColor: displayStatus === 'certified' ? '#f0fdf4' : '#fff1f2',
              border: `1px solid ${displayStatus === 'certified' ? '#bbf7d0' : '#fecdd3'}`,
            }}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: displayStatus === 'certified' ? '#15803d' : '#e11d48' }}
            >
              {displayStatus === 'certified' ? '✓ Certified as industry-standard' : '✗ Rejected'}
            </span>
            <button
              onClick={reset}
              disabled={isBusy}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">
            Notes {displayStatus === 'pending' ? '(optional)' : ''}
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes about this simulation's suitability, any gaps, or feedback for the admin team…"
            rows={4}
            className="w-full rounded-lg px-3 py-2.5 text-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none resize-none text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600">
            {error}
          </p>
        )}

        {displayStatus === 'pending' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => certify('rejected')}
              disabled={isBusy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #fecdd3',
              }}
            >
              <XCircle size={15} />
              {submitting === 'rejected' ? 'Submitting…' : 'Reject'}
            </button>
            <button
              onClick={() => certify('certified')}
              disabled={isBusy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
              }}
            >
              <CheckCircle2 size={15} />
              {submitting === 'certified' ? 'Submitting…' : 'Certify'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
