import React from 'react'
import '@/app/globals.css'
import { ReviewerNav } from './_nav'
import { Toaster } from '@/components/ui'

export const metadata = { title: 'Reviewer Portal — CareerBridge' }

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <ReviewerNav />
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      <Toaster />
    </div>
  )
}
