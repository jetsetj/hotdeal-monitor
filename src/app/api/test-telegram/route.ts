import { NextResponse } from 'next/server'
import { testTelegramConnection } from '@/lib/telegram'

export async function POST() {
  try {
    const result = await testTelegramConnection()

    if (result.success) {
      return NextResponse.json({ success: true, message: '테스트 메시지 전송 완료!' })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}
