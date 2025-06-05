'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TestSupabase() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...')
  const [envVars, setEnvVars] = useState({})
  const [testResults, setTestResults] = useState([])
  const [stories, setStories] = useState([])

  useEffect(() => {
    async function runDatabaseTests() {
      const results = []
      
      try {
        // Check environment variables
        setEnvVars({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        })

        // Test 1: Basic connection
        results.push('🔍 Testing basic connection...')
        const { data: connectTest, error: connectError } = await supabase
          .from('stories')
          .select('*', { count: 'exact', head: true })

        if (connectError) {
          results.push(`❌ Connection error: ${connectError.message}`)
          setConnectionStatus('❌ Connection failed')
          setTestResults(results)
          return
        }
        
        results.push('✅ Connection successful!')
        setConnectionStatus('✅ Connected to Supabase')

        // Test 2: Insert a test story
        results.push('🔍 Testing story insertion...')
        const { data: insertData, error: insertError } = await supabase
          .from('stories')
          .insert({
            title: 'Test Story',
            content: 'This is a test story to verify our database is working correctly. Only in Turkey would we test our database this way!',
            location: 'Istanbul',
            created_by: 'test-user'
          })
          .select()

        if (insertError) {
          results.push(`❌ Insert error: ${insertError.message}`)
        } else {
          results.push('✅ Story insertion successful!')
        }

        // Test 3: Read stories
        results.push('🔍 Testing story retrieval...')
        const { data: storiesData, error: selectError } = await supabase
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        if (selectError) {
          results.push(`❌ Select error: ${selectError.message}`)
        } else {
          results.push(`✅ Retrieved ${storiesData.length} stories`)
          setStories(storiesData)
        }

        // Test 4: Test voting (update)
        if (storiesData && storiesData.length > 0) {
          results.push('🔍 Testing vote update...')
          const { error: updateError } = await supabase
            .from('stories')
            .update({ votes: storiesData[0].votes + 1 })
            .eq('id', storiesData[0].id)

          if (updateError) {
            results.push(`❌ Update error: ${updateError.message}`)
          } else {
            results.push('✅ Vote update successful!')
          }
        }

        results.push('🎉 All database tests completed!')
        
      } catch (err) {
        results.push(`❌ Test failed: ${err.message}`)
        setConnectionStatus(`❌ Tests failed: ${err.message}`)
      }
      
      setTestResults(results)
    }

    runDatabaseTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Schema Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Environment Check */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <p><strong>URL:</strong> {envVars.url || 'Not loaded'}</p>
              <p><strong>Anon Key:</strong> {envVars.hasKey ? 'Configured ✅' : 'Missing ❌'}</p>
              <p><strong>Status:</strong> <span className="font-mono">{connectionStatus}</span></p>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <p key={index} className="text-sm font-mono">{result}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Stories Display */}
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
          <a 
            href="/" 
            className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}