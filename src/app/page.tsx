'use client'

import { useState } from 'react'
import DealList from '@/components/DealList'

export default function DashboardPage() {
  const [polling, setPolling] = useState(false)
  const [pollingResult, setPollingResult] = useState<{
    newDeals: number
    notified: number
    error?: string
  } | null>(null)

  const runPolling = async () => {
    setPolling(true)
    setPollingResult(null)

    try {
      const res = await fetch('/api/check', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        const summary = data.data?.summary
        setPollingResult({
          newDeals: summary?.totalNewDeals || 0,
          notified: summary?.totalMatchedDeals || 0,
        })
      } else {
        const errorMsg = typeof data.error === 'string' 
          ? data.error 
          : data.error?.message || '폴링 실패'
        setPollingResult({ newDeals: 0, notified: 0, error: errorMsg })
      }
    } catch {
      setPollingResult({ newDeals: 0, notified: 0, error: '연결 실패' })
    } finally {
      setPolling(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">핫딜 대시보드</h1>
        <button
          onClick={runPolling}
          disabled={polling}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {polling ? (
            <>
              <span className="animate-spin">⟳</span> 폴링 중...
            </>
          ) : (
            <>
              🔄 RSS 폴링 실행
            </>
          )}
        </button>
      </div>

      {pollingResult && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            pollingResult.error ? 'bg-red-900/50 border border-red-700' : 'bg-green-900/50 border border-green-700'
          }`}
        >
          {pollingResult.error ? (
            <p className="text-red-300">❌ {pollingResult.error}</p>
          ) : (
            <p className="text-green-300">
              ✅ 체크 완료! 새 핫딜 {pollingResult.newDeals}개 발견, {pollingResult.notified}개 알림 전송
            </p>
          )}
        </div>
      )}

      <DealList />
    </div>
  )
}
