import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storyId } = body

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      )
    }

    console.log('Story ID:', storyId, 'Type:', typeof storyId)

    // First, get the current vote count
    const { data: currentStory, error: fetchError } = await supabase
      .from('stories')
      .select('votes')
      .eq('id', storyId)
      .single()

    console.log('Current story:', currentStory)
    console.log('Fetch error:', fetchError)

    if (fetchError || !currentStory) {
      console.error('Error fetching story:', fetchError)
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Increment the vote count
    const newVoteCount = (currentStory.votes || 0) + 1

    console.log('New vote count:', newVoteCount)

    // Update the vote count and return the updated data
    const { data, error } = await supabase
      .from('stories')
      .update({ 
        votes: newVoteCount
      })
      .eq('id', storyId)
      .select('votes')

    console.log('Data:', data)
    console.log('Error:', error)

    if (error) {
      console.error('Error updating vote:', error)
      return NextResponse.json(
        { error: 'Failed to update vote' },
        { status: 500 }
      )
    }

    // Check if update was successful (data is now an array)
    if (!data || data.length === 0) {
      console.error('No rows updated. Story might not exist.')
      return NextResponse.json(
        { error: 'Story not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      votes: data[0].votes,
      message: 'Vote recorded successfully'
    })

  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 