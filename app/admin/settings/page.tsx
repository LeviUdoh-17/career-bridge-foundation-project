import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import packageJson from '@/package.json'

const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('.supabase.co', '')}.supabase.co`.replace(
      /^https?:\/\//,
      ''
    )
  : null

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm mt-1 text-slate-600">Environment and system configuration</p>
      </div>

      {/* Team management */}
      <section className="bg-white rounded-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Team & access</h2>
            <p className="text-xs text-slate-600 mt-1">
              Admins and reviewers are managed via role-based access control.
            </p>
          </div>
          <Link
            href="/admin/team"
            className="text-xs font-medium text-teal hover:text-teal/80 transition-colors"
          >
            Manage team →
          </Link>
        </div>
        <div className="px-6 py-4 text-sm text-slate-600">
          Role assignments (admin, reviewer) are stored in the{' '}
          <code className="font-mono text-xs text-teal/80">user_roles</code> table and
          embedded in JWTs via the custom access token hook.
        </div>
      </section>

      {/* App info */}
      <section className="bg-white rounded-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Application</h2>
        </div>
        <div className="divide-y divide-slate-200">
          <InfoRow label="App name" value={packageJson.name} />
          <InfoRow label="Version" value={`v${packageJson.version}`} />
          <InfoRow label="Next.js" value={packageJson.dependencies.next} />
        </div>
      </section>

      {/* API Docs */}
      <section className="bg-white rounded-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">API Documentation</h2>
            <p className="text-xs text-slate-600 mt-1">
              Interactive OpenAPI 3.0 reference for all admin, reviewer, and public routes.
            </p>
          </div>
          <Link
            href="/api-docs"
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-teal hover:text-teal/80 transition-colors font-medium"
          >
            Open Swagger UI
            <ExternalLink size={12} />
          </Link>
        </div>
        <div className="divide-y divide-slate-200">
          <div className="flex items-center justify-between px-6 py-3">
            <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">JSON spec</span>
            <a
              href="/api/docs"
              target="_blank"
              className="text-sm font-mono text-teal hover:text-teal/80 transition-colors"
            >
              /api/docs
            </a>
          </div>
        </div>
      </section>

      {/* Supabase */}
      <section className="bg-white rounded-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Supabase</h2>
        </div>
        <div className="divide-y divide-slate-200">
          <InfoRow
            label="Project URL"
            value={SUPABASE_PROJECT_URL ?? '—'}
          />
          <div className="flex items-center justify-between px-6 py-3">
            <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">Dashboard</span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-teal hover:text-teal/80 transition-colors font-medium"
            >
              Open Supabase
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <span className="text-xs text-slate-600 font-medium uppercase tracking-widest">{label}</span>
      <span className="text-sm text-slate-900 font-mono">{value}</span>
    </div>
  )
}
