import Parser from 'rss-parser'
import { RssItem } from '@/types'

const parser = new Parser({
  timeout: 15000,
  headers: {
    // 일부 사이트(예: 루리웹)는 기본 요청 헤더에서 차단될 수 있어 브라우저 유사 UA를 사용
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
  },
  customFields: {
    item: [
      ['dc:creator', 'dc:creator'],
      ['author', 'author'],
    ],
  },
})

export interface ParsedFeed {
  title?: string
  link?: string
  items: RssItem[]
}

export async function parseRssFeed(url: string): Promise<ParsedFeed> {
  let lastError: unknown

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const feed = await parser.parseURL(url)
      return {
        title: feed.title,
        link: feed.link,
        items: feed.items.map((item) => ({
          title: item.title,
          link: item.link,
          content: item.content,
          contentSnippet: item.contentSnippet,
          isoDate: item.isoDate,
          'dc:creator': (item as unknown as Record<string, unknown>)['dc:creator'] as string | undefined,
          creator: item.creator,
          author: item.author,
        })),
      }
    } catch (error) {
      lastError = error
      // 일시적인 403/timeout 대비 1회 재시도
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 350))
      }
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : '알 수 없는 오류'
  throw new Error(`RSS 파싱 실패: ${url} (${message})`)
}

export function extractSiteName(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace('www.', '')
    return hostname.split('.')[0]
  } catch {
    return 'Unknown'
  }
}

export function extractPrice(text: string): string | null {
  const patterns = [
    /[\d,]+원/,
    /[\d,]+\s*원/,
    /₩[\d,]+/,
    /[\d,]+(~[\d,]+원)?/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[0].replace(/,/g, '')
    }
  }
  return null
}
