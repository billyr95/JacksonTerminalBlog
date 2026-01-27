'use client'

import { Comment } from '@/types'
import CommentItem from './CommentItem'

interface CommentListProps {
  comments: Comment[]
  color: string
}

export default function CommentList({ comments, color }: CommentListProps) {
  if (!comments || comments.length === 0) return null

  return (
    <div className="comments-section">
      <div className="comments-header" style={{ color }}>
        &gt; COMMENTS [{comments.length}]
      </div>
      {comments.map((comment, index) => (
        <CommentItem key={index} comment={comment} color={color} />
      ))}
    </div>
  )
}
