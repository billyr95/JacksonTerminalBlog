'use client'

import { Comment } from '@/types'

interface CommentItemProps {
  comment: Comment
  color: string
}

export default function CommentItem({ comment, color }: CommentItemProps) {
  return (
    <div className="comment">
      <div className="comment-author" style={{ color }}>
        {comment.author}
        <span className="comment-date" style={{ color }}>{comment.date}</span>
      </div>
      <div className="comment-text" style={{ color }}>{comment.text}</div>
    </div>
  )
}
