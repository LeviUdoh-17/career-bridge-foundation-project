import { NextResponse } from 'next/server'
import spec from '@/lib/swagger'

export function GET() {
  return NextResponse.json(spec)
}
