import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    const { id, enabled } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '피드 ID가 필요합니다' } },
        { status: 400 }
      )
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '유효한 enabled 값이 필요합니다' } },
        { status: 400 }
      )
    }

    const feed = await prisma.feed.findUnique({ where: { id } })
    if (!feed) {
      return NextResponse.json(
        { success: false, error: { code: 'FEED_NOT_FOUND', message: '피드를 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    await prisma.feed.update({
      where: { id },
      data: { enabled },
    })

    return NextResponse.json({
      success: true,
      message: enabled ? '피드가 활성화되었습니다' : '피드가 비활성화되었습니다',
    })
  } catch (error) {
    console.error('피드 상태 변경 실패:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '피드 상태 변경 실패' } },
      { status: 500 }
    )
  }
}
