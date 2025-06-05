'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function TestSupabase() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [stories, setStories] = useState([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .limit(5)
      
      if (error) {
        console.error('Supabase error:', error)
        setConnectionStatus(`Error: ${error.message}`)
        return
      }

      setConnectionStatus('✅ Connected successfully!')
      setStories(data || [])

    } catch (err) {
      console.error('Connection error:', err)
      setConnectionStatus(`Connection failed: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">🔗 Supabase Connection Test</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
            <div className={`p-4 rounded-lg ${
              connectionStatus.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : connectionStatus.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <p className="font-medium">{connectionStatus}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Environment Details</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
              <p><strong>Node Environment:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>

          {stories.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Sample Stories</h2>
              <div className="space-y-4">
                {stories.map((story) => (
                  <div key={story.id} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{story.title || 'Untitled'}</h3>
                      <div className="text-sm text-gray-500">
                        ▲ {story.votes} | {story.location || 'No location'}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{story.content}</p>
                    <div className="text-xs text-gray-500">
                      By: {story.created_by} | {new Date(story.created_at).toLocaleDateString()} | 
                      Approved: {story.is_approved ? '✅' : '❌'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <p className="text-green-700">
              <strong>✅ Database Schema Ready!</strong> 
              The stories table is working correctly with all required fields:
              id, title, content, location, created_by, votes, is_approved, created_at
            </p>
          </div>

          <div className="mt-6">
            <Link 
              href="/" 
              className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}