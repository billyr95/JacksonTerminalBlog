import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity.server'

export async function POST(request: NextRequest) {
  // Add this logging
  console.log('Token exists:', !!process.env.SANITY_API_TOKEN)
  console.log('Token length:', process.env.SANITY_API_TOKEN?.length)
  
  try {
    const { postId, commentPath, author, text, isReply } = await request.json()

    if (isReply && commentPath) {
      // Add reply to existing comment
      const newReply = {
        _key: `r${Date.now()}`,
        _type: 'comment',
        author,
        text,
        date: new Date().toISOString(),
        replies: []
      }

      await serverClient
        .patch(postId)
        .setIfMissing({ [commentPath]: [] })
        .append(commentPath, [newReply])
        .commit()
    } else {
      // Add new top-level comment
      const newComment = {
        _key: `c${Date.now()}`,
        _type: 'comment',
        author,
        text,
        date: new Date().toISOString(),
        replies: []
      }

      await serverClient
        .patch(postId)
        .setIfMissing({ comments: [] })
        .append('comments', [newComment])
        .commit()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to save comment' },
      { status: 500 }
    )
  }
}