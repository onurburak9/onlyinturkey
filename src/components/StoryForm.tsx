'use client'

import { useState, useEffect } from 'react'

interface StoryFormProps {
  onSubmit?: (story: { title: string; content: string; location: string }) => void
  onClose?: () => void
  isLoading?: boolean
}

export default function StoryForm({ onSubmit, onClose, isLoading = false }: StoryFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Clear form when component mounts or when not loading (after successful submission)
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setFormData({
          title: '',
          content: '',
          location: ''
        })
        setErrors({})
      }, 2000) // Clear after success message is shown

      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = 'Story content is required'
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Story must be at least 10 characters long'
    } else if (formData.content.trim().length > 2000) {
      newErrors.content = 'Story must be less than 2000 characters'
    }

    // Title validation (optional but if provided, should be reasonable length)
    if (formData.title.trim() && formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm() && onSubmit) {
      onSubmit({
        title: formData.title.trim(),
        content: formData.content.trim(),
        location: formData.location.trim()
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCancel = () => {
    // Clear form immediately when canceling
    setFormData({
      title: '',
      content: '',
      location: ''
    })
    setErrors({})
    if (onClose) {
      onClose()
    }
  }

  const contentLength = formData.content.length
  const isContentValid = contentLength >= 10 && contentLength <= 2000

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Share Your Turkey Story</h2>
        <p className="text-sm text-gray-600">
          Tell us about an experience that made you say &ldquo;Only in Turkey!&rdquo;
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field (Optional) */}
        <div>
          <label htmlFor="title" className="block text-xs font-medium text-gray-700 mb-1">
            Title <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Give your story a title..."
            className={`w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${ 
              errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            disabled={isLoading}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Content Field (Required) */}
        <div>
          <label htmlFor="content" className="block text-xs font-medium text-gray-700 mb-1">
            Your Story <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="What happened that made you think &lsquo;Only in Turkey!&rsquo;?"
            rows={4}
            className={`w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all ${ 
              errors.content ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            disabled={isLoading}
          />
          
          {/* Character Counter */}
          <div className="mt-1 flex justify-between items-center">
            <div>
              {errors.content && (
                <p className="text-xs text-red-600">{errors.content}</p>
              )}
            </div>
            <div className={`text-xs ${
              contentLength < 10 ? 'text-gray-400' : 
              contentLength > 2000 ? 'text-red-500' : 
              isContentValid ? 'text-green-600' : 'text-gray-500'
            }`}>
              {contentLength}/2000
            </div>
          </div>
        </div>

        {/* Location Field (Optional) */}
        <div>
          <label htmlFor="location" className="block text-xs font-medium text-gray-700 mb-1">
            Location <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Istanbul, Ankara, Izmir..."
            className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:border-gray-300 transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-transparent border border-gray-300 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!isContentValid || isLoading}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              isContentValid && !isLoading
                ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-4 focus:ring-red-200'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Share Story</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}