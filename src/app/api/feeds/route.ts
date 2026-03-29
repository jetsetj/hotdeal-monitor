import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseRssFeed } from '@/lib/rss'
import { ApiResponse, Feed } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<Feed[]>>> {
  try {
    const feeds = await prisma.feed.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: feeds,
    })
  } catch (error) {
    console.error('피드 목록 조회 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: '피드 목록 조회 실패' },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Feed>>> {
  try {
    const body = await request.json()
    const { name, url } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '피드 이름을 입력해주세요' } },
        { status: 400 }
      )
    }

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'RSS URL을 입력해주세요' } },
        { status: 400 }
      )
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 URL입니다' } },
        { status: 400 }
      )
    }

    const existingFeed = await prisma.feed.findUnique({ where: { url } })
    if (existingFeed) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_FEED', message: '이미 등록된 RSS URL입니다' } },
        { status: 400 }
      )
    }

    try {
      await parseRssFeed(url)
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_RSS', message: '유효하지 않은 RSS 형식입니다' } },
        { status: 400 }
      )
    }

    const feed = await prisma.feed.create({
      data: {
        name: name.trim(),
        url: url.trim(),
      },
    })

    return NextResponse.json(
      { success: true, data: feed, message: '피드가 추가되었습니다' },
      { status: 201 }
    )
  } catch (error) {
    console.error('피드 추가 실패:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '피드 추가 실패' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    const { id } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '피드 ID가 필요합니다' } },
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

    await prisma.feed.delete({ where: { id } })

    return NextResponse.json({ success: true, message: '피드가 삭제되었습니다' })
  } catch (error) {
    console.error('피드 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '피드 삭제 실패' } },
      { status: 500 }
    )
  }
}
