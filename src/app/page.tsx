'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Modal from '@/components/Modal'
import StoryForm from '@/components/StoryForm'
import StoriesList from '@/components/StoriesList'

export default function Home() {
  const [activeTab, setActiveTab] = useState('new')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [refreshStories, setRefreshStories] = useState(false)
  
  // Stats state
  const [stats, setStats] = useState({
    totalStories: 0,
    storiesThisWeek: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Fetch stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true)
        const response = await fetch('/api/stats')
        const data = await response.json()
        
        if (response.ok) {
          setStats({
            totalStories: data.totalStories,
            storiesThisWeek: data.storiesThisWeek
          })
        } else {
          console.error('Failed to fetch stats:', data.error)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Refresh stats when stories are refreshed
  useEffect(() => {
    if (refreshStories) {
      const fetchStats = async () => {
        try {
          const response = await fetch('/api/stats')
          const data = await response.json()
          
          if (response.ok) {
            setStats({
              totalStories: data.totalStories,
              storiesThisWeek: data.storiesThisWeek
            })
          }
        } catch (error) {
          console.error('Error refreshing stats:', error)
        }
      }

      fetchStats()
    }
  }, [refreshStories])

  const handleStorySubmit = async (storyData: { title: string; content: string; location: string }) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit story')
      }

      setSubmitMessage({
        type: 'success',
        text: result.message || 'Your story has been shared successfully!'
      })

      // Trigger stories refresh
      setRefreshStories(true)

      // Close modal after success
      setTimeout(() => {
        setIsModalOpen(false)
        setSubmitMessage(null)
        setRefreshStories(false)
      }, 2000)

    } catch (error) {
      console.error('Submission error:', error)
      setSubmitMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false)
      setSubmitMessage(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans tracking-tight">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center px-8">
          <div className="flex items-center space-x-3">
            {/* Turkish Flag */}
            <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200">
              <Image 
                src="https://media.istockphoto.com/id/1144879597/vector/turkey-square-flag-icon.jpg?s=612x612&w=0&k=20&c=6imyXQzTbSmXDSfklvbLY6TcUhFvatYlp73uWzX8I88="
                alt="Turkish Flag"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Only in Turkey
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content Area (2/3 width) */}
          <main className="col-span-8">
            {/* Hero Section */}
            <div className="bg-red-50 border border-red-100 p-6 mb-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Share your 🇹🇷 Turkey story
              </h2>
              
              <div className="text-gray-700 space-y-3 text-sm leading-normal">
                <p>We love Turkey ❤️</p>
                
                <p>
                  From the çay glasses that appear everywhere like magic, to the warmth of people who&apos;ll invite you to dinner after knowing you for five minutes, Turkey has an undeniable charm that keeps us here.
                </p>
                
                <p>
                  But anyone who lives here knows the other side — the bureaucratic maze where you need 7 different documents to get 1 document, the government services that seem designed to test your sanity, and those business interactions that leave you wondering if customer service is a foreign concept.
                </p>
                
                <p>
                  There are experiences so distinctly Turkish in their inefficiency that explaining them abroad sounds like fiction. The kind of service interactions that make you question whether basic functionality is optional.
                </p>
                
                <p>
                  When people point out these issues, the usual response is &quot;if you don&apos;t like it, leave.&quot; (Ya Sev Ya Terket 😡) But that&apos;s not problem-solving — that&apos;s problem-avoiding.
                </p>
                
                <p>
                  This space is for documenting these patterns. The government office visits that require multiple trips for mysteriously changing requirements. The utility companies with their own interpretation of logic. The businesses where &quot;customer is always right&quot; translates to &quot;customer is always confused.&quot;
                </p>
                
                <p>
                  By collecting these stories, maybe we can show there&apos;s a distinct pattern of service dysfunction that affects everyone — locals and foreigners alike. Because acknowledging problems is the first step toward fixing them.
                </p>
                
                <p className="font-semibold text-gray-900 text-xs">
                  POSTS ARE FULLY ANONYMOUS!!
                </p>
              
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`px-3 py-2 text-sm transition-colors flex items-center space-x-2 rounded-lg border ${
                    activeTab === 'new'
                      ? 'text-gray-900 font-bold bg-white border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100'
                      : 'text-gray-600 font-medium bg-transparent border-gray-300 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>New</span>
                </button>
                <button
                  onClick={() => setActiveTab('top')}
                  className={`px-3 py-2 text-sm transition-colors flex items-center space-x-2 rounded-lg border ${
                    activeTab === 'top'
                      ? 'text-gray-900 font-bold bg-white border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100'
                      : 'text-gray-600 font-medium bg-transparent border-gray-300 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>Top</span>
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`px-3 py-2 text-sm transition-colors flex items-center space-x-2 rounded-lg border ${
                    activeTab === 'trending'
                      ? 'text-gray-900 font-bold bg-white border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100'
                      : 'text-gray-600 font-medium bg-transparent border-gray-300 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z" clipRule="evenodd" />
                  </svg>
                  <span>Trending</span>
                </button>
                <div className="flex items-center space-x-2 ml-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 w-36 bg-white placeholder-gray-400"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button className="p-2 text-gray-600 bg-transparent border border-gray-300 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-100 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Responsive Post Button */}
              <button 
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors rounded flex items-center"
                onClick={() => setIsModalOpen(true)}
              >
                {/* Desktop version */}
                <div className="hidden lg:flex items-center space-x-2 px-5 py-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Post your Turkey story</span>
                </div>
                {/* Mobile version - just plus icon */}
                <div className="lg:hidden p-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Stories Section */}
            <StoriesList sortBy={activeTab} onRefresh={refreshStories} />
          </main>

          {/* Right Sidebar */}
          <aside className="col-span-4">
            {/* Community Stats */}
            <div className="bg-white border border-gray-200 p-5 rounded-lg">
              <h3 className="font-semibold text-gray-900 text-base mb-3">Community Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">Total Stories</span>
                  {statsLoading ? (
                    <div className="h-4 w-8 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <span className="font-medium text-gray-900 text-sm">{stats.totalStories}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">This Week</span>
                  {statsLoading ? (
                    <div className="h-4 w-8 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <span className="font-medium text-gray-900 text-sm">{stats.storiesThisWeek}</span>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Share your experiences to help improve service quality in Turkey 🇹🇷
          </p>
        </div>
      </div>

      {/* Story Submission Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {/* Success/Error Message */}
        {submitMessage && (
          <div className={`mb-6 p-4 border rounded ${
            submitMessage.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {submitMessage.type === 'success' ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">{submitMessage.text}</span>
            </div>
          </div>
        )}
        
        <StoryForm 
          onSubmit={handleStorySubmit} 
          onClose={closeModal}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  )
}