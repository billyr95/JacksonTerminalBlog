'use client'

import { useState } from 'react'

interface AddCommentProps {
  postId: string
  color: string
  isLoggedIn: boolean
  username: string
  onAddComment: (author: string, text: string) => void
}

export default function AddComment({ 
  postId, 
  color, 
  isLoggedIn, 
  username, 
  onAddComment 
}: AddCommentProps) {
  const [commentText, setCommentText] = useState('')
  const [guestUsername, setGuestUsername] = useState('')

  const handleSubmit = () => {
    const author = isLoggedIn ? username : (guestUsername.trim() || 'anonymous')
    const text = commentText.trim()
    
    if (!text) {
      alert('ERROR: Comment text cannot be empty')
      return
    }
    
    onAddComment(author, text)
    
    // Clear inputs
    setCommentText('')
    if (!isLoggedIn) {
      setGuestUsername('')
    }
  }

  return (
    <div className="add-comment">
      <div className="comments-header" style={{ color }}>
        &gt; ADD COMMENT
      </div>
      
      {isLoggedIn ? (
        <div className="system-message" style={{ color, fontSize: '12px', margin: '10px 0' }}>
          Posting as: {username}
        </div>
      ) : (
        <div className="input-line">
          <span className="prompt-symbol" style={{ color }}>&gt;</span>
          <input 
            type="text" 
            placeholder="username" 
            value={guestUsername}
            onChange={(e) => setGuestUsername(e.target.value)}
            style={{ 
              width: '150px', 
              backgroundColor: 'transparent', 
              border: 'none', 
              color, 
              fontFamily: "'CustomFont', 'Courier New', monospace",
              outline: 'none'
            }}
          />
        </div>
      )}
      
      <textarea 
        className="comment-input" 
        placeholder="Enter your comment..." 
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        style={{ color, borderColor: color }}
      />
      
      <button 
        className="comment-submit" 
        onClick={handleSubmit}
        style={{ color, borderColor: color }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = color
          e.currentTarget.style.color = '#000'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = color
        }}
      >
        [ POST COMMENT ]
      </button>
    </div>
  )
}
