'use client'

import { useState, useEffect } from 'react'
import { Comment } from '@/types'

interface CommentItemProps {
  comment: Comment
  color: string
  depth?: number
  isLoggedIn: boolean
  username: string
  onReply: (commentId: string, author: string, text: string) => void
}

export default function CommentItem({ 
  comment, 
  color, 
  depth = 0,
  isLoggedIn,
  username,
  onReply
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showAllReplies, setShowAllReplies] = useState(false)
  const [relativeTime, setRelativeTime] = useState('')
  
  const hasReplies = comment.replies && comment.replies.length > 0
  const replyCount = comment.replies?.length || 0
  const visibleReplies = showAllReplies ? comment.replies : comment.replies?.slice(0, 3)
  const hiddenCount = replyCount - 3

  // Check if this comment has been saved to Sanity
  const isTemporary = comment._saved === false
  
  // Check if this is the current user's comment
  const isOwnComment = isLoggedIn && comment.author === username
  
  // Cap indentation at 4 levels (120px)
  const maxIndent = 4
  const actualDepth = Math.min(depth, maxIndent)
  const marginLeft = actualDepth > 0 ? `${actualDepth * 30}px` : '0'

  // Calculate relative time
  useEffect(() => {
    const calculateRelativeTime = () => {
      // Parse the ISO timestamp from Sanity
      const commentDate = new Date(comment.date)
      const now = new Date()
      const diffMs = now.getTime() - commentDate.getTime()
      const diffSeconds = Math.floor(diffMs / 1000)
      const diffMinutes = Math.floor(diffSeconds / 60)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffSeconds < 60) {
        setRelativeTime(`${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`)
      } else if (diffMinutes < 60) {
        setRelativeTime(`${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`)
      } else if (diffHours < 24) {
        setRelativeTime(`${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`)
      } else {
        setRelativeTime(`${diffDays} day${diffDays !== 1 ? 's' : ''} ago`)
      }
    }

    calculateRelativeTime()
    // Update every 10 seconds for more accurate "just now" timing
    const interval = setInterval(calculateRelativeTime, 10000)
    return () => clearInterval(interval)
  }, [comment.date])

  const handleReplySubmit = () => {
    if (!replyText.trim()) {
      alert('ERROR: Reply text cannot be empty')
      return
    }
    
    if (isTemporary) {
      alert('Please wait for the comment to save before replying.')
      return
    }
    
    const author = isLoggedIn ? username : 'anonymous'
    onReply(comment.id, author, replyText)
    setReplyText('')
    setShowReplyForm(false)
  }

  return (
    <div 
      className="comment" 
      style={{ 
        marginLeft,
        borderLeftWidth: actualDepth > 0 ? '1px' : '2px',
        margin: '10px 0',
        padding: '10px',
        borderLeftColor: '#555',
        borderLeftStyle: 'solid',
        backgroundColor: '#050505'
      }}
    >
      <div className="comment-author" style={{ color }}>
        <span style={{ 
          fontWeight: isOwnComment ? 'bold' : 'normal',
          color: isOwnComment ? '#00ff00' : color
        }}>
          {comment.author}
        </span>
        <span className="comment-date" style={{ color, marginLeft: '10px', fontSize: '10px' }}>
          {relativeTime}
        </span>
        {isTemporary && (
          <span style={{ color: '#888', fontSize: '10px', marginLeft: '10px' }}>
            (saving...)
          </span>
        )}
      </div>
      <div className="comment-text" style={{ color }}>{comment.text}</div>
      
      {/* Reply button - show if comment is saved (no depth limit) */}
      {!isTemporary && (
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          style={{
            background: 'none',
            border: 'none',
            color,
            cursor: 'pointer',
            fontSize: '11px',
            marginTop: '8px',
            padding: '0'
          }}
        >
          [ REPLY ]
        </button>
      )}
      
      {/* Show message if temporary */}
      {isTemporary && (
        <div style={{ 
          color: '#888', 
          fontSize: '10px', 
          marginTop: '8px',
          fontStyle: 'italic'
        }}>
          Saving comment...
        </div>
      )}
      
      {/* Reply form */}
      {showReplyForm && (
        <div style={{ marginTop: '10px' }}>
          {isLoggedIn && (
            <div className="system-message" style={{ color, fontSize: '10px', margin: '5px 0' }}>
              Replying as: {username}
            </div>
          )}
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            style={{
              width: '100%',
              minHeight: '50px',
              backgroundColor: '#0a0a0a',
              border: `1px solid ${color}`,
              color,
              fontFamily: "'CustomFont', 'Courier New', monospace",
              fontSize: '12px',
              padding: '8px',
              resize: 'vertical'
            }}
          />
          <div style={{ marginTop: '5px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleReplySubmit}
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${color}`,
                color,
                padding: '4px 12px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: "'CustomFont', 'Courier New', monospace"
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
              [ POST REPLY ]
            </button>
            <button
              onClick={() => {
                setShowReplyForm(false)
                setReplyText('')
              }}
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${color}`,
                color,
                padding: '4px 12px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: "'CustomFont', 'Courier New', monospace"
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
              [ CANCEL ]
            </button>
          </div>
        </div>
      )}
      
      {/* Replies */}
      {hasReplies && (
        <div style={{ marginTop: '10px' }}>
          {visibleReplies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              color={color}
              depth={depth + 1}
              isLoggedIn={isLoggedIn}
              username={username}
              onReply={onReply}
            />
          ))}
          
          {/* Show More button */}
          {!showAllReplies && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllReplies(true)}
              style={{
                background: 'none',
                border: 'none',
                color,
                cursor: 'pointer',
                fontSize: '11px',
                marginTop: '8px',
                marginLeft: '30px',
                padding: '0'
              }}
            >
              [ SHOW {hiddenCount} MORE {hiddenCount === 1 ? 'REPLY' : 'REPLIES'} ]
            </button>
          )}
          
          {/* Show Less button */}
          {showAllReplies && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllReplies(false)}
              style={{
                background: 'none',
                border: 'none',
                color,
                cursor: 'pointer',
                fontSize: '11px',
                marginTop: '8px',
                marginLeft: '30px',
                padding: '0'
              }}
            >
              [ SHOW LESS ]
            </button>
          )}
        </div>
      )}
    </div>
  )
}