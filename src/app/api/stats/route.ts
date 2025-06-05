import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(): Promise<NextResponse> {
  try {
    // Get total stories count
    const { data: allStories, error: allStoriesError } = await supabase
      .from('stories')
      .select('id', { count: 'exact' })
      .eq('is_approved', true)

    if (allStoriesError) {
      console.error('Error fetching all stories:', allStoriesError)
      throw allStoriesError
    }

    // Get stories from this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { data: weekStories, error: weekStoriesError } = await supabase
      .from('stories')
      .select('id', { count: 'exact' })
      .eq('is_approved', true)
      .gte('created_at', oneWeekAgo.toISOString())

    if (weekStoriesError) {
      console.error('Error fetching week stories:', weekStoriesError)
      throw weekStoriesError
    }

    return NextResponse.json({
      totalStories: allStories?.length || 0,
      storiesThisWeek: weekStories?.length || 0
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 