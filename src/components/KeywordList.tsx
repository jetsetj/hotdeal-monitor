'use client'

import { useEffect, useState } from 'react'
import { Keyword } from '@/types'

export default function KeywordList() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)

  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/keywords')
      const data = await res.json()
      if (data.success) {
        setKeywords(data.data)
      }
    } catch (error) {
      console.error('키워드 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeywords()
  }, [])

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/keywords', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      })

      if (res.ok) {
        setKeywords((prev) =>
          prev.map((kw) =>
            kw.id === id ? { ...kw, enabled } : kw
          )
        )
      }
    } catch (error) {
      console.error('키워드 상태 변경 실패:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetch('/api/keywords', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setKeywords((prev) => prev.filter((kw) => kw.id !== id))
      }
    } catch (error) {
      console.error('키워드 삭제 실패:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>
  }

  if (keywords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        등록된 키워드가 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <div
          key={keyword.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            keyword.enabled
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-900 border-gray-800 opacity-50'
          }`}
        >
          <button
            onClick={() => handleToggle(keyword.id, !keyword.enabled)}
            className={`w-8 h-4 rounded-full transition-colors ${
              keyword.enabled ? 'bg-primary-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`block w-3 h-3 bg-white rounded-full transition-transform mt-0.5 ${
                keyword.enabled ? 'ml-4' : 'ml-0.5'
              }`}
            />
          </button>

          <span className={`font-medium ${keyword.enabled ? 'text-white' : 'text-gray-500'}`}>
            {keyword.text}
          </span>

          <button
            onClick={() => handleDelete(keyword.id)}
            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            title="삭제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
