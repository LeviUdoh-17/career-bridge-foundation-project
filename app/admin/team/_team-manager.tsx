'use client'

import React, { useState, useTransition } from 'react'
import { UserRoleRecord, AdminPermissions } from '@/types/database'
import { Trash2, Plus, ShieldCheck, Eye, ChevronDown, ChevronRight, Settings } from 'lucide-react'

type Member = Omit<UserRoleRecord, 'granted_by'> & { disciplines: string[] }

const PERMISSION_LABELS: Record<keyof AdminPermissions, string> = {
  canManageSimulations: 'Manage Simulations',
  canManageUsers:       'Manage Team',
  canViewAnalytics:     'View Analytics',
  canExportData:        'Export Data',
}

const ROLE_BADGE: Record<string, { label: string; bg: string; color: string; border: string }> = {
  super_admin: { label: 'Super Admin', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  admin:       { label: 'Admin',       bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  reviewer:    { label: 'Reviewer',    bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
}

export function TeamManager({
  initialMembers,
  isSuperAdmin,
}: {
  initialMembers: Member[]
  isSuperAdmin: boolean
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [showAdd, setShowAdd] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Add form state
  const [addEmail, setAddEmail]       = useState('')
  const [addRole, setAddRole]         = useState<'admin' | 'reviewer'>('admin')
  const [addDiscs, setAddDiscs]       = useState('')
  const [addError, setAddError]       = useState('')
  const [addLoading, setAddLoading]   = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAddLoading(true)
    try {
      const disciplines = addRole === 'reviewer'
        ? addDiscs.split(',').map(s => s.trim()).filter(Boolean)
        : []

      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail.trim(), role: addRole, disciplines }),
      })
      const json = await res.json()
      if (!res.ok) { setAddError(json.error ?? 'Failed'); return }

      // Refresh list
      const listRes = await fetch('/api/admin/team')
      const listJson = await listRes.json()
      setMembers(listJson.members ?? [])
      setAddEmail('')
      setAddDiscs('')
      setShowAdd(false)
    } catch {
      setAddError('Network error')
    } finally {
      setAddLoading(false)
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remove this team member?')) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/team/${userId}`, { method: 'DELETE' })
      if (res.ok) setMembers(m => m.filter(x => x.user_id !== userId))
    })
  }

  async function handlePermissionToggle(
    member: Member,
    perm: keyof AdminPermissions,
    value: boolean
  ) {
    const next = { ...member.permissions, [perm]: value }
    const res = await fetch(`/api/admin/team/${member.user_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: next }),
    })
    if (res.ok) {
      setMembers(prev =>
        prev.map(m => m.user_id === member.user_id ? { ...m, permissions: next } : m)
      )
    }
  }

  const badge = (role: string) => ROLE_BADGE[role] ?? { label: role, bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight" style={{ color: '#003359' }}>
            Team
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(0,51,89,0.45)' }}>
            Manage admin and reviewer access
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#003359' }}
          >
            <Plus size={15} />
            Add member
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div
          className="rounded-xl p-6 space-y-4"
          style={{ backgroundColor: '#fff', border: '1px solid #d5dce8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: '#003359' }}>Add team member</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Email</label>
                <input
                  type="email" required value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">Role</label>
                <select
                  value={addRole}
                  onChange={e => setAddRole(e.target.value as 'admin' | 'reviewer')}
                  className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 focus:border-teal outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="reviewer">Reviewer</option>
                </select>
              </div>
            </div>

            {addRole === 'reviewer' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                  Disciplines <span className="normal-case font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text" value={addDiscs}
                  onChange={e => setAddDiscs(e.target.value)}
                  placeholder="e.g. Software Engineering, Finance, Marketing"
                  className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
                />
              </div>
            )}

            {addError && (
              <p className="text-sm px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700">{addError}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit" disabled={addLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
                style={{ backgroundColor: '#003359' }}
              >
                {addLoading ? 'Adding…' : 'Add member'}
              </button>
              <button
                type="button" onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Member list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#fff', border: '1px solid #d5dce8', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        {members.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No team members yet. Add an admin or reviewer above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map(member => {
              const b = badge(member.role)
              const isExpanded = expandedId === member.user_id
              const isAdmin = member.role === 'admin'
              const isReviewer = member.role === 'reviewer'
              const isSA = member.role === 'super_admin'

              return (
                <div key={member.user_id}>
                  <div className="flex items-center gap-4 px-6 py-4">
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: b.bg, color: b.color, border: `1px solid ${b.border}` }}
                    >
                      {(member.email ?? '?')[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {member.email ?? member.user_id}
                      </div>
                      {isReviewer && member.disciplines.length > 0 && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate">
                          {member.disciplines.join(' · ')}
                        </div>
                      )}
                    </div>

                    {/* Role badge */}
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: b.bg, color: b.color, border: `1px solid ${b.border}` }}
                    >
                      {b.label}
                    </span>

                    {/* Role icon */}
                    {isSA && <ShieldCheck size={15} style={{ color: b.color, flexShrink: 0 }} />}
                    {isReviewer && <Eye size={15} style={{ color: b.color, flexShrink: 0 }} />}

                    {/* Actions */}
                    {isSuperAdmin && !isSA && (
                      <div className="flex items-center gap-1 shrink-0">
                        {(isAdmin || isReviewer) && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : member.user_id)}
                            className="p-1.5 rounded text-slate-400 hover:text-slate-600 transition-colors"
                            title="Edit"
                          >
                            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(member.user_id)}
                          disabled={isPending}
                          className="p-1.5 rounded text-slate-400 hover:text-red-500 transition-colors disabled:opacity-40"
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded: permission toggles for admins / disciplines for reviewers */}
                  {isExpanded && (
                    <div className="px-6 pb-5" style={{ borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
                      {isAdmin && (
                        <div className="pt-4 space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                            <Settings size={12} /> Permissions
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            {(Object.keys(PERMISSION_LABELS) as (keyof AdminPermissions)[]).map(perm => (
                              <label key={perm} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={!!member.permissions?.[perm]}
                                    onChange={e => handlePermissionToggle(member, perm, e.target.checked)}
                                  />
                                  <div className="w-9 h-5 rounded-full transition-colors bg-slate-200 peer-checked:bg-teal" />
                                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                                </div>
                                <span className="text-sm text-slate-700">{PERMISSION_LABELS[perm]}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {isReviewer && (
                        <ReviewerDisciplinesEditor
                          userId={member.user_id}
                          initialDisciplines={member.disciplines}
                          onSaved={disciplines => {
                            setMembers(prev =>
                              prev.map(m => m.user_id === member.user_id ? { ...m, disciplines } : m)
                            )
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewerDisciplinesEditor({
  userId,
  initialDisciplines,
  onSaved,
}: {
  userId: string
  initialDisciplines: string[]
  onSaved: (disciplines: string[]) => void
}) {
  const [value, setValue] = useState(initialDisciplines.join(', '))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    const disciplines = value.split(',').map(s => s.trim()).filter(Boolean)
    const res = await fetch(`/api/admin/team/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disciplines }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error ?? 'Failed'); return }
    onSaved(disciplines)
  }

  return (
    <div className="pt-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Disciplines</p>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="e.g. Software Engineering, Finance"
        className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60 transition-colors"
        style={{ backgroundColor: '#003359' }}
      >
        {saving ? 'Saving…' : 'Save disciplines'}
      </button>
    </div>
  )
}
