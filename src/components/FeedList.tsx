'use client'

import { useEffect, useState } from 'react'
import { Feed } from '@/types'

export default function FeedList() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeeds = async () => {
    try {
      const res = await fetch('/api/feeds')
      const data = await res.json()
      if (data.success) {
        setFeeds(data.data)
      }
    } catch (error) {
      console.error('피드 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeeds()
  }, [])

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/feeds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      })

      if (res.ok) {
        setFeeds((prev) =>
          prev.map((feed) =>
            feed.id === id ? { ...feed, enabled } : feed
          )
        )
      }
    } catch (error) {
      console.error('피드 상태 변경 실패:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch('/api/feeds', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setFeeds((prev) => prev.filter((feed) => feed.id !== id))
      }
    } catch (error) {
      console.error('피드 삭제 실패:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>
  }

  if (feeds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        등록된 피드가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {feeds.map((feed) => (
        <div
          key={feed.id}
          className={`p-4 rounded-lg border ${
            feed.enabled
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-900 border-gray-800 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(feed.id, !feed.enabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  feed.enabled ? 'bg-primary-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    feed.enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
              <div>
                <p className="text-white font-medium">{feed.name}</p>
                <p className="text-gray-500 text-sm truncate max-w-xs">{feed.url}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(feed.id)}
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              title="삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
