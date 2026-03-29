import Parser from 'rss-parser'
import { RssItem } from '@/types'

const parser = new Parser({
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
        'dc:creator': (item as Record<string, unknown>)['dc:creator'] as string | undefined,
        creator: item.creator,
        author: item.author,
      })),
    }
  } catch (error) {
    throw new Error(`RSS 파싱 실패: ${url}`)
  }
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
