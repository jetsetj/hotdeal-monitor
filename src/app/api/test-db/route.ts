import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DB 연결 실패'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
