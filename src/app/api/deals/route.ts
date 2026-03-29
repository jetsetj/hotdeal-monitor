import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, Deal } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Deal[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const keyword = searchParams.get('keyword') || ''
    const feedName = searchParams.get('feedName') || ''

    const where: Record<string, unknown> = {}

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { price: { contains: keyword } },
      ]
    }

    if (feedName) {
      where.feed = { name: { contains: feedName } }
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          feed: {
            select: {
              id: true,
              name: true,
              url: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: deals,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('핫딜 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '핫딜 목록 조회 실패' } },
      { status: 500 }
    )
  }
}
