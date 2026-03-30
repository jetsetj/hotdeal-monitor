'use client'

import { useState } from 'react'

export default function KeywordsPage() {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [dbTesting, setDbTesting] = useState(false)
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const testTelegram = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const res = await fetch('/api/test-telegram', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setTestResult({ success: true, message: '테스트 메시지 전송 완료!' })
      } else {
        setTestResult({ success: false, message: data.error || '설정 오류' })
      }
    } catch {
      setTestResult({ success: false, message: '연결 실패' })
    } finally {
      setTesting(false)
    }
  }

  const testDatabase = async () => {
    setDbTesting(true)
    setDbTestResult(null)

    try {
      const res = await fetch('/api/test-db', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setDbTestResult({ success: true, message: 'DB 연결 성공!' })
      } else {
        setDbTestResult({ success: false, message: data.error || '연결 오류' })
      }
    } catch {
      setDbTestResult({ success: false, message: '연결 실패' })
    } finally {
      setDbTesting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">키워드 관리</h1>

      <div className="mb-8">
        <KeywordForm />
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">연결 설정</h2>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={testTelegram}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {testing ? '테스트 중...' : '🔔 텔레그램 테스트'}
          </button>
          {testResult && (
            <span className={testResult.success ? 'text-green-400' : 'text-red-400'}>
              {testResult.message}
            </span>
          )}
          <button
            onClick={testDatabase}
            disabled={dbTesting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {dbTesting ? '테스트 중...' : '🗄️ DB 연결 테스트'}
          </button>
          {dbTestResult && (
            <span className={dbTestResult.success ? 'text-green-400' : 'text-red-400'}>
              {dbTestResult.message}
            </span>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">등록된 키워드</h2>
        <KeywordList />
      </div>
    </div>
  )
}

import KeywordForm from '@/components/KeywordForm'
import KeywordList from '@/components/KeywordList'
