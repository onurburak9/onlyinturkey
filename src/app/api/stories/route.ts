import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Story {
  id: number
  title: string | null
  content: string
  location: string | null
  votes: number
  created_at: string
  is_approved: boolean
  created_by: string
}

interface StoryWithTime extends Story {
  timeAgo: string
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sort') || 'new' // 'new', 'top', or 'trending'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query based on sort parameter
    let query = supabase
      .from('stories')
      .select('*')
      .eq('is_approved', true)
      .range(offset, offset + limit - 1)

    // Apply sorting
    switch (sortBy) {
      case 'top':
        query = query.order('votes', { ascending: false })
        break
      case 'trending':
        // For trending, we'll use a combination of votes and recency
        // For now, let's use votes as the primary factor
        query = query.order('votes', { ascending: false })
        break
      case 'new':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    // Transform data to include relative time
    const storiesWithTime: StoryWithTime[] = (data as Story[]).map(story => ({
      ...story,
      timeAgo: getTimeAgo(story.created_at)
    }))

    return NextResponse.json({
      stories: storiesWithTime,
      count: data.length,
      hasMore: data.length === limit, // If we got exactly the limit, there might be more
      offset: offset,
      nextOffset: offset + data.length
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// Helper function to calculate time ago
function getTimeAgo(dateString: string): string {
  const now = new Date()
  const storyDate = new Date(dateString)
  const diffInMs = now.getTime() - storyDate.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) {
    return 'Just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  } else if (diffInHours < 24) {
    return `About ${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  } else if (diffInDays === 1) {
    return 'About 1 day ago'
  } else if (diffInDays < 30) {
    return `About ${diffInDays} days ago`
  } else {
    return storyDate.toLocaleDateString()
  }
} 