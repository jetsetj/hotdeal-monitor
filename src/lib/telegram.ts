interface TelegramMessage {
  title: string
  price?: string | null
  link: string
  siteName: string
}

export async function testTelegramConnection(): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || botToken === 'your-telegram-bot-token') {
    return { success: false, error: 'Bot Token이 설정되지 않았습니다' }
  }

  if (!chatId || chatId === 'your-telegram-chat-id') {
    return { success: false, error: 'Chat ID가 설정되지 않았습니다' }
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ *핫딜 모니터 연결 테스트*\n\n텔레그램 설정이 완료되었습니다! 이제 키워드 매칭 시 알림을 받습니다.',
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!response.ok) {
      const data = await response.json()
      return { success: false, error: data.description || '알 수 없는 오류' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: '연결 실패' }
  }
}

export async function sendTelegramNotification(message: TelegramMessage): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('Telegram 설정이 없습니다')
    return false
  }

  const text = `🔥 핫딜 발견!

[${message.siteName}] ${message.title}
${message.price ? `💰 가격: ${message.price}` : ''}
🔗 ${message.link}`

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Telegram API 오류: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('Telegram 알림 전송 실패:', error)
    return false
  }
}
