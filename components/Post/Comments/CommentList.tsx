'use client'

import { useState } from 'react'
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
  const [showAll, setShowAll] = useState(false)
  
  if (!comments || comments.length === 0) return null

  // Reverse to show newest first
  const reversedComments = [...comments].reverse()
  
  // Show only first 3 unless expanded
  const visibleComments = showAll ? reversedComments : reversedComments.slice(0, 3)
  const hiddenCount = reversedComments.length - 3

  return (
    <div className="comments-section">
      <div className="comments-header" style={{ color }}>
        &gt; COMMENTS [{comments.length}]
      </div>
      
      {visibleComments.map((comment) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          color={color}
          isLoggedIn={isLoggedIn}
          username={username}
          onReply={onReply}
        />
      ))}
      
      {/* Show button only if there are more than 3 comments */}
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            background: 'none',
            border: `1px solid ${color}`,
            color,
            cursor: 'pointer',
            fontSize: '12px',
            marginTop: '15px',
            padding: '8px 16px',
            fontFamily: "'CustomFont', 'Courier New', monospace",
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = color
            e.currentTarget.style.color = '#000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = color
          }}
        >
          [ VIEW ALL {comments.length} COMMENTS ]
        </button>
      )}
      
      {/* Show "collapse" button when expanded */}
      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          style={{
            background: 'none',
            border: `1px solid ${color}`,
            color,
            cursor: 'pointer',
            fontSize: '12px',
            marginTop: '15px',
            padding: '8px 16px',
            fontFamily: "'CustomFont', 'Courier New', monospace",
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = color
            e.currentTarget.style.color = '#000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = color
          }}
        >
          [ SHOW LESS ]
        </button>
      )}
    </div>
  )
}