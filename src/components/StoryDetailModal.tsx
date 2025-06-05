'use client'

interface Story {
  id: number
  title: string | null
  content: string
  location: string | null
  votes: number
  created_at: string
  timeAgo: string
}

interface StoryDetailModalProps {
  story: Story | null
  isOpen: boolean
  onClose: () => void
  onVote: (storyId: number) => void
  isVoting: boolean
  hasVoted: boolean
}

export default function StoryDetailModal({ 
  story, 
  isOpen, 
  onClose, 
  onVote, 
  isVoting, 
  hasVoted 
}: StoryDetailModalProps) {
  if (!isOpen || !story) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onVote(story.id)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-600 opacity-50 transition-all duration-300"
        onClick={handleBackdropClick}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100 border border-gray-100">
          {/* Close Button */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-full transition-all duration-200 hover:scale-110 group"
              aria-label="Close modal"
            >
              <svg 
                className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-8">
            {/* Header */}
            <div className="mb-6 pr-8">
              <h2 className="text-xl font-bold text-gray-900">
                {story.title || 'Untitled Story'}
              </h2>
            </div>

            {/* Content */}
            <div className="mb-6 overflow-y-auto max-h-[50vh]">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                  {story.content}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                {/* Story metadata */}
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {story.location || 'Turkey'}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {story.timeAgo}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    0 comments
                  </span>
                </div>

                {/* Vote button */}
                <button
                  onClick={handleVoteClick}
                  disabled={isVoting || hasVoted}
                  title={
                    isVoting 
                      ? 'Voting...' 
                      : hasVoted
                      ? 'You have already voted on this story'
                      : 'Click to vote'
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isVoting 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : hasVoted
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  {isVoting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className={`w-4 h-4 ${hasVoted ? 'text-green-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                  <span>{story.votes}</span>
                  <span>{hasVoted ? 'Voted' : 'Vote'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 