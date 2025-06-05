import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface StorySubmission {
  title?: string
  content: string
  location?: string
}

interface StoryData {
  title: string | null
  content: string
  location: string | null
  created_by: string
  votes: number
  is_approved: boolean
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body: StorySubmission = await request.json()
    const { title, content, location } = body

    // Validation
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Story content is required' },
        { status: 400 }
      )
    }

    // Trim content and validate length
    const trimmedContent = content.trim()
    if (trimmedContent.length < 10) {
      return NextResponse.json(
        { error: 'Story must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json(
        { error: 'Story must be less than 2000 characters' },
        { status: 400 }
      )
    }

    // Validate title if provided
    const trimmedTitle = title ? title.trim() : ''
    if (trimmedTitle && trimmedTitle.length > 200) {
      return NextResponse.json(
        { error: 'Title must be less than 200 characters' },
        { status: 400 }
      )
    }

    // Validate location if provided
    const trimmedLocation = location ? location.trim() : ''
    if (trimmedLocation && trimmedLocation.length > 100) {
      return NextResponse.json(
        { error: 'Location must be less than 100 characters' },
        { status: 400 }
      )
    }

    // Basic content sanitization (remove potential script tags)
    const sanitizedContent = trimmedContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')

    const sanitizedTitle = trimmedTitle
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')

    // Prepare data for insertion
    const storyData: StoryData = {
      title: sanitizedTitle || null,
      content: sanitizedContent,
      location: trimmedLocation || null,
      created_by: 'anonymous', // For now, all submissions are anonymous
      votes: 0,
      is_approved: true // Auto-approve for now, can change to false for moderation later
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('stories')
      .insert([storyData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save story. Please try again.' },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'Story shared successfully!',
        story: data[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
} 