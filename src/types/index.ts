export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  pagination?: Pagination
  error?: {
    code: string
    message: string
  }
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Feed {
  id: string
  name: string
  url: string
  enabled: boolean
  createdAt: Date
  deals?: Deal[]
}

export interface Keyword {
  id: string
  text: string
  enabled: boolean
  createdAt: Date
}

export interface Deal {
  id: string
  title: string
  link: string
  price: string | null
  siteName: string
  notified: boolean
  createdAt: Date
  feedId: string
  feed?: Feed
}

export interface FeedCreateInput {
  name: string
  url: string
}

export interface KeywordCreateInput {
  text: string
}

export interface ToggleInput {
  id: string
  enabled: boolean
}

export interface DeleteInput {
  id: string
}

export interface DealsQueryParams {
  page?: number
  limit?: number
  keyword?: string
  siteName?: string
}

export interface RssItem {
  title?: string
  link?: string
  content?: string
  contentSnippet?: string
  isoDate?: string
  'dc:creator'?: string
  creator?: string
  author?: string
}
