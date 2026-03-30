'use client'

import { useState, useEffect, useRef } from 'react'
import DealCard from './DealCard'
import { Deal } from '@/types'

interface Feed {
  id: string
  name: string
}

interface DealListProps {
  refreshTrigger?: number
}

export default function DealList({ refreshTrigger }: DealListProps) {
  const [deals, setDeals] = useState<Deal[]>([])
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const keywordRef = useRef('')
  const activeTabRef = useRef('all')
  const feedsRef = useRef<Feed[]>([])

  const fetchFeeds = async () => {
    try {
      const res = await fetch('/api/feeds')
      const data = await res.json()
      if (data.success) {
        setFeeds(data.data || [])
        feedsRef.current = data.data || []
      }
    } catch (error) {
      console.error('피드 목록 조회 실패:', error)
    }
  }

  const fetchDeals = async (pageNum: number, append: boolean = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      })
      const kw = keywordRef.current
      const tab = activeTabRef.current
      if (kw) params.set('keyword', kw)
      if (tab !== 'all') params.set('feedName', tab)

      const res = await fetch(`/api/deals?${params}`)
      const data = await res.json()

      if (data.success) {
        if (append) {
          setDeals((prev) => [...prev, ...data.data])
        } else {
          setDeals(data.data)
        }
        setTotalPages(data.pagination.totalPages)
        setHasMore(pageNum < data.pagination.totalPages)
      }
    } catch (error) {
      console.error('핫딜 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  useEffect(() => {
    setPage(1)
    fetchDeals(1)
  }, [])

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchFeeds()
      fetchDeals(1)
    }
  }, [refreshTrigger])

  const handleTabChange = (feedName: string) => {
    setActiveTab(feedName)
    activeTabRef.current = feedName
    setKeyword('')
    keywordRef.current = ''
    setPage(1)
    fetchDeals(1)
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchDeals(nextPage, true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    keywordRef.current = keyword
    setPage(1)
    fetchDeals(1)
  }

  const showEmptyState = deals.length === 0 && !loading
  const showLoading = loading && deals.length === 0

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          전체
        </button>
        {feeds.map((feed) => (
          <button
            key={feed.id}
            onClick={() => handleTabChange(feed.name)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === feed.name
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {feed.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder={`${activeTab === 'all' ? '전체' : activeTab}에서 검색...`}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          검색
        </button>
      </form>

      {showLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {activeTab === 'all' ? '등록된 핫딜이 없습니다.' : '이 피드에 등록된 핫딜이 없습니다.'}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            피드와 키워드를 등록하고 핫딜을 확인해보세요!
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? '로딩 중...' : '더 보기'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
