import FeedForm from '@/components/FeedForm'
import FeedList from '@/components/FeedList'

export default function FeedsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">RSS 피드 관리</h1>

      <div className="mb-8">
        <FeedForm />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">등록된 피드</h2>
        <FeedList />
      </div>
    </div>
  )
}
