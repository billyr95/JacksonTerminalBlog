import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity.server'
import { client } from '@/lib/sanity.client'

export const dynamic = 'force-dynamic'

// GET - fetch current play count
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'postId required' }, { status: 400 })
    }

    const result = await client.fetch(
      `*[_id == $postId][0]{ playCount }`,
      { postId }
    )

    return NextResponse.json({ playCount: result?.playCount || 0 })
  } catch (error) {
    console.error('Error fetching play count:', error)
    return NextResponse.json({ error: 'Failed to fetch play count' }, { status: 500 })
  }
}

// POST - increment play count
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: 'postId required' }, { status: 400 })
    }

    // Increment the play count
    const result = await serverClient
      .patch(postId)
      .setIfMissing({ playCount: 0 })
      .inc({ playCount: 1 })
      .commit()

    return NextResponse.json({ 
      success: true, 
      playCount: result.playCount 
    })
  } catch (error) {
    console.error('Error incrementing play count:', error)
    return NextResponse.json({ error: 'Failed to increment play count' }, { status: 500 })
  }
}