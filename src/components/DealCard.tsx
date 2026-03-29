'use client'

import { Deal } from '@/types'

interface DealCardProps {
  deal: Deal
}

export default function DealCard({ deal }: DealCardProps) {
  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors border border-gray-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
              {deal.siteName}
            </span>
            {deal.notified && (
              <span className="px-2 py-0.5 bg-green-600 rounded text-xs text-white">
                알림완료
              </span>
            )}
          </div>

          <a
            href={deal.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-white font-medium hover:text-primary-400 transition-colors line-clamp-2 mb-2"
          >
            {deal.title}
          </a>

          {deal.price && (
            <p className="text-primary-400 font-bold text-lg">
              {deal.price}
            </p>
          )}

          <p className="text-gray-500 text-xs mt-2">
            {formatDate(deal.createdAt)}
          </p>
        </div>

        <a
          href={deal.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors"
          title="링크 열기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  )
}
