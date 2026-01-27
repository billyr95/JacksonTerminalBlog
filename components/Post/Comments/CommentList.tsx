'use client'

import { Comment } from '@/types'
import CommentItem from './CommentItem'

interface CommentListProps {
  comments: Comment[]
  color: string
  isLoggedIn: boolean
  username: string
  onReply: (commentId: string, author: string, text: string) => void
}

export default function CommentList({ comments, color, isLoggedIn, username, onReply }: CommentListProps) {
  if (!comments || comments.length === 0) return null

  return (
    <div className="comments-section">
      <div className="comments-header" style={{ color }}>
        &gt; COMMENTS [{comments.length}]
      </div>
      {comments.map((comment) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          color={color}
          isLoggedIn={isLoggedIn}
          username={username}
          onReply={onReply}
        />
      ))}
    </div>
  )
}