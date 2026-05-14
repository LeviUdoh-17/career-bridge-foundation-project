'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { LogOut } from 'lucide-react'

export function ReviewerNav() {
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/reviewer" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="CareerBridge" width={28} height={28} />
          <div>
            <div className="text-slate-900 font-bold text-sm leading-none">CareerBridge</div>
            <div
              className="text-xs font-semibold tracking-widest uppercase mt-0.5"
              style={{ color: '#0d9488' }}
            >
              Reviewer Portal
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {email && (
            <span className="text-xs text-slate-500 hidden sm:block">{email}</span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
