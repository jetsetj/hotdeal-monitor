import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, Keyword } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<Keyword[]>>> {
  try {
    const keywords = await prisma.keyword.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: keywords,
    })
  } catch (error) {
    console.error('키워드 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '키워드 목록 조회 실패' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Keyword>>> {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '키워드를 입력해주세요' } },
        { status: 400 }
      )
    }

    const existingKeyword = await prisma.keyword.findUnique({
      where: { text: text.trim() },
    })

    if (existingKeyword) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_KEYWORD', message: '이미 등록된 키워드입니다' } },
        { status: 400 }
      )
    }

    const keyword = await prisma.keyword.create({
      data: {
        text: text.trim(),
      },
    })

    return NextResponse.json(
      { success: true, data: keyword, message: '키워드가 추가되었습니다' },
      { status: 201 }
    )
  } catch (error) {
    console.error('키워드 추가 실패:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '키워드 추가 실패' } },
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
        { success: false, error: { code: 'VALIDATION_ERROR', message: '키워드 ID가 필요합니다' } },
        { status: 400 }
      )
    }

    const keyword = await prisma.keyword.findUnique({ where: { id } })
    if (!keyword) {
      return NextResponse.json(
        { success: false, error: { code: 'KEYWORD_NOT_FOUND', message: '키워드를 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    await prisma.keyword.delete({ where: { id } })

    return NextResponse.json({ success: true, message: '키워드가 삭제되었습니다' })
  } catch (error) {
    console.error('키워드 삭제 실패:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '키워드 삭제 실패' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    const { id, enabled } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '키워드 ID가 필요합니다' } },
        { status: 400 }
      )
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '유효한 enabled 값이 필요합니다' } },
        { status: 400 }
      )
    }

    const keyword = await prisma.keyword.findUnique({ where: { id } })
    if (!keyword) {
      return NextResponse.json(
        { success: false, error: { code: 'KEYWORD_NOT_FOUND', message: '키워드를 찾을 수 없습니다' } },
        { status: 404 }
      )
    }

    await prisma.keyword.update({
      where: { id },
      data: { enabled },
    })

    return NextResponse.json({
      success: true,
      message: enabled ? '키워드가 활성화되었습니다' : '키워드가 비활성화되었습니다',
    })
  } catch (error) {
    console.error('키워드 상태 변경 실패:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '키워드 상태 변경 실패' } },
      { status: 500 }
    )
  }
}
