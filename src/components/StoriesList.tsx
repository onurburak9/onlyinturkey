'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import StoryDetailModal from '@/components/StoryDetailModal'

interface Story {
  id: number
  title: string | null
  content: string
  location: string | null
  votes: number
  created_at: string
  timeAgo: string
}

interface StoriesListProps {
  sortBy?: string
  onRefresh?: boolean
}

// Helper functions for vote tracking
const getVotedStories = (): number[] => {
  if (typeof window === 'undefined') return []
  try {
    const voted = localStorage.getItem('voted_stories')
    return voted ? JSON.parse(voted) : []
  } catch {
    return []
  }
}

const addVotedStory = (storyId: number): void => {
  if (typeof window === 'undefined') return
  try {
    const voted = getVotedStories()
    if (!voted.includes(storyId)) {
      voted.push(storyId)
      localStorage.setItem('voted_stories', JSON.stringify(voted))
    }
  } catch (error) {
    console.error('Error saving vote to localStorage:', error)
  }
}

const hasVotedOnStory = (storyId: number): boolean => {
  return getVotedStories().includes(storyId)
}

export default function StoriesList({ sortBy = 'new', onRefresh = false }: StoriesListProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [votingStoryId, setVotingStoryId] = useState<number | null>(null)
  const [votedStories, setVotedStories] = useState<number[]>([])
  
  // Modal state
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Ref for intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Load voted stories from localStorage on mount
  useEffect(() => {
    setVotedStories(getVotedStories())
  }, [])

  const fetchStories = useCallback(async (currentOffset = 0, append = false) => {
    try {
      if (currentOffset === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const response = await fetch(`/api/stories?sort=${sortBy}&limit=20&offset=${currentOffset}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stories')
      }

      const newStories = data.stories || []
      
      if (append) {
        setStories(prev => [...prev, ...newStories])
      } else {
        setStories(newStories)
      }
      
      setHasMore(data.hasMore)
      setOffset(currentOffset + newStories.length)
      
    } catch (err) {
      console.error('Error fetching stories:', err)
      setError(err instanceof Error ? err.message : 'Failed to load stories')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [sortBy])

  // Load more stories when intersection observer triggers
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchStories(offset, true)
    }
  }, [loadingMore, hasMore, loading, offset, fetchStories])

  // Intersection Observer setup
  useEffect(() => {
    const currentRef = loadMoreRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loadMore])

  // Initial load and sort change
  useEffect(() => {
    setOffset(0)
    setHasMore(true)
    fetchStories(0, false)
  }, [sortBy, fetchStories])

  // Refresh functionality
  useEffect(() => {
    if (onRefresh) {
      setOffset(0)
      setHasMore(true)
      fetchStories(0, false)
    }
  }, [onRefresh, fetchStories])

  const handleVote = async (storyId: number) => {
    if (votingStoryId) return // Prevent double-clicking
    
    // Check if user has already voted on this story
    if (hasVotedOnStory(storyId)) {
      setError('You have already voted on this story.')
      setTimeout(() => setError(null), 3000)
      return
    }
    
    try {
      setVotingStoryId(storyId)
      
      // Optimistic update - update UI immediately
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, votes: story.votes + 1 }
            : story
        )
      )

      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyId }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Revert optimistic update on error
        setStories(prev => 
          prev.map(story => 
            story.id === storyId 
              ? { ...story, votes: story.votes - 1 }
              : story
          )
        )
        console.error('Vote failed:', result.error)
        setError('Failed to record vote. Please try again.')
        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000)
        return
      }

      // Mark story as voted and update local state
      addVotedStory(storyId)
      setVotedStories(prev => [...prev, storyId])

      // Update with actual vote count from server (in case of race conditions)
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, votes: result.votes }
            : story
        )
      )

    } catch (err) {
      // Revert optimistic update on error
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, votes: story.votes - 1 }
            : story
        )
      )
      console.error('Vote error:', err)
      setError('Failed to record vote. Please try again.')
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000)
    } finally {
      setVotingStoryId(null)
    }
  }

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStory(null)
  }

  const handleVoteFromModal = async (storyId: number) => {
    await handleVote(storyId)
    // Update the selected story with the new vote count
    if (selectedStory && selectedStory.id === storyId) {
      const updatedStory = stories.find(s => s.id === storyId)
      if (updatedStory) {
        setSelectedStory(updatedStory)
      }
    }
  }

  if (loading && stories.length === 0) {
    return (
      <div className="space-y-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border-b border-gray-200 p-4 animate-pulse">
            <div className="flex justify-between">
              <div className="flex-1 pr-6">
                <div className="h-4 bg-gray-200 mb-2 w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 w-full"></div>
                  <div className="h-3 bg-gray-200 w-5/6"></div>
                  <div className="h-3 bg-gray-200 w-4/6"></div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 bg-gray-200 w-16"></div>
                    <div className="h-3 bg-gray-200 w-20"></div>
                  </div>
                </div>
              </div>
              <div className="w-16 flex flex-col items-center justify-center">
                <div className="h-4 w-4 bg-gray-200 mb-1"></div>
                <div className="h-6 w-8 bg-gray-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && stories.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-medium">Failed to load stories</p>
        </div>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => fetchStories(0, false)}
          className="px-4 py-2 bg-gray-900 text-white text-sm hover:bg-gray-800 transition-colors rounded"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (stories.length === 0 && !loading) {
    return (
      <div className="bg-white border border-gray-200 p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium text-gray-600">No stories yet</p>
        </div>
        <p className="text-gray-500 text-sm">Be the first to share your Turkey experience!</p>
      </div>
    )
  }

  return (
    <div className="space-y-0 outline rounded-t-lg">
      {stories.map((story, index) => (
        <div key={story.id} className={`bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors relative h-32 ${
          index === 0 ? 'rounded-t-lg' : ''
        }`}>
          <div className="flex h-full">
            <div 
              className="flex-1 p-4 pr-4 cursor-pointer"
              onClick={() => handleStoryClick(story)}
            >
              <h3 
                className="font-bold text-gray-900 text-base leading-snug mb-2 overflow-hidden break-words"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word'
                }}
              >
                {story.title || 'Untitled Story'}
              </h3>
              <p 
                className="text-gray-700 text-sm leading-normal font-medium mb-3 overflow-hidden break-words"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis',
                  height: '2.5rem',
                  minHeight: '2.5rem',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word'
                }}
              >
                {story.content}
              </p>
              <div className="flex items-center text-xs text-gray-500 space-x-3 mt-auto">
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {story.location || 'Turkey'}
                </span>
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {story.timeAgo}
                </span>
              </div>
            </div>
            {/* Full-height vertical divider */}
            <div className="w-px bg-gray-200"></div>
            <div className="flex flex-col items-center justify-center w-16">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleVote(story.id)
                }}
                disabled={votingStoryId === story.id || votedStories.includes(story.id)}
                title={
                  votingStoryId === story.id 
                    ? 'Voting...' 
                    : votedStories.includes(story.id)
                    ? 'You have already voted on this story'
                    : 'Click to vote'
                }
                className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                  votingStoryId === story.id 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : votedStories.includes(story.id)
                    ? 'bg-green-50 cursor-not-allowed'
                    : 'hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                {votingStoryId === story.id ? (
                  <svg className="w-4 h-4 mb-1 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className={`w-4 h-4 mb-1 transition-colors ${
                    votedStories.includes(story.id)
                      ? 'text-green-600'
                      : 'text-gray-400 group-hover:text-green-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
                <span className={`text-xl font-bold transition-colors ${
                  votingStoryId === story.id 
                    ? 'text-gray-400' 
                    : votedStories.includes(story.id)
                    ? 'text-green-600'
                    : 'text-gray-900 group-hover:text-green-600'
                }`}>
                  {story.votes}
                </span>
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Load More Trigger Element */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4">
          {loadingMore ? (
            <div className="bg-white border-b border-gray-200 p-4 animate-pulse h-32">
              <div className="flex h-full">
                <div className="flex-1 pr-4">
                  <div className="h-4 bg-gray-200 mb-2 w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 w-full"></div>
                    <div className="h-3 bg-gray-200 w-5/6"></div>
                  </div>
                  <div className="flex items-center space-x-3 mt-4">
                    <div className="h-3 bg-gray-200 w-16"></div>
                    <div className="h-3 bg-gray-200 w-20"></div>
                  </div>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="w-16 flex flex-col items-center justify-center bg-gray-100">
                  <div className="h-4 w-4 bg-gray-200 mb-1"></div>
                  <div className="h-6 w-8 bg-gray-200"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-400">
                <svg className="w-5 h-5 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* End of Results */}
      {!hasMore && stories.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">🎉 You&apos;ve reached the end! No more stories to load.</p>
        </div>
      )}

      {/* Story Detail Modal */}
      <StoryDetailModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onVote={handleVoteFromModal}
        isVoting={votingStoryId === selectedStory?.id}
        hasVoted={selectedStory ? votedStories.includes(selectedStory.id) : false}
      />
    </div>
  )
} 