'use client'

import { useState } from 'react'

export default function FeedForm() {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url }),
      })

      const data = await res.json()

      if (data.success) {
        setName('')
        setUrl('')
        window.location.reload()
      } else {
        const errorMessage = data.error?.message || '피드 추가에 실패했습니다'
        if (data.error?.code === 'INVALID_RSS') {
          alert(`${errorMessage}\n\n올바른 RSS 피드 URL을 입력해주세요.\n(예: https://example.com/rss 또는 https://example.com/feed.xml)`)
        }
        setError(errorMessage)
      }
    } catch {
      setError('피드 추가에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">새 피드 추가</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">피드 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 클리앙 핫딜"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">RSS URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/rss"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading ? '추가 중...' : '피드 추가'}
        </button>
      </div>
    </form>
  )
}
