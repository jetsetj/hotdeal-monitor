import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { parseRssFeed, extractSiteName, extractPrice } from '@/lib/rss'
import { sendTelegramNotification } from '@/lib/telegram'
import { ApiResponse } from '@/types'

interface CheckResult {
  feedId: string
  feedName: string
  newDeals: number
  matchedDeals: number
  errors: string[]
}

export async function POST(): Promise<NextResponse<ApiResponse>> {
  try {
    const feeds = await prisma.feed.findMany({
      where: { enabled: true },
    })

    const keywords = await prisma.keyword.findMany({
      where: { enabled: true },
    })

    const results: CheckResult[] = []
    let totalNewDeals = 0
    let totalMatchedDeals = 0

    for (const feed of feeds) {
      const result: CheckResult = {
        feedId: feed.id,
        feedName: feed.name,
        newDeals: 0,
        matchedDeals: 0,
        errors: [],
      }

      try {
        const parsedFeed = await parseRssFeed(feed.url)
        await prisma.feed.update({
          where: { id: feed.id },
          data: {
            lastCheckStatus: 'ok',
            lastCheckError: null,
            lastCheckedAt: new Date(),
          },
        })
        const siteName = parsedFeed.title || extractSiteName(feed.url)

        for (const item of parsedFeed.items) {
          if (!item.title || !item.link) continue

          const existingDeal = await prisma.deal.findUnique({
            where: { link: item.link },
          })

          if (existingDeal) continue

          const price = extractPrice(item.content || item.contentSnippet || item.title)

          const deal = await prisma.deal.create({
            data: {
              title: item.title,
              link: item.link,
              price,
              siteName,
              feedId: feed.id,
            },
          })

          result.newDeals++
          totalNewDeals++

          const contentToMatch = `${item.title} ${item.content || ''} ${item.contentSnippet || ''}`.toLowerCase()
          const matchedKeyword = keywords.find((kw) =>
            contentToMatch.includes(kw.text.toLowerCase())
          )

          if (matchedKeyword && !deal.notified) {
            const sent = await sendTelegramNotification({
              title: deal.title,
              price: deal.price,
              link: deal.link,
              siteName: deal.siteName,
            })

            if (sent) {
              await prisma.deal.update({
                where: { id: deal.id },
                data: { notified: true },
              })
              result.matchedDeals++
              totalMatchedDeals++
            }
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '알 수 없는 오류'
        result.errors.push(message)
        await prisma.feed.update({
          where: { id: feed.id },
          data: {
            lastCheckStatus: 'error',
            lastCheckError: message,
            lastCheckedAt: new Date(),
          },
        })
        console.error(`피드 "${feed.name}" 처리 중 오류:`, error)
      }

      results.push(result)
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          totalFeeds: feeds.length,
          totalNewDeals,
          totalMatchedDeals,
        },
      },
      message: `처리 완료: ${totalNewDeals}개 새 Deal, ${totalMatchedDeals}개 알림 발송`,
    })
  } catch (error) {
    console.error('핫딜 체크 실패:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: '핫딜 체크 실패' } },
      { status: 500 }
    )
  }
}
