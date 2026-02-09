'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { BlogPost as BlogPostType } from '@/types'
import LoginScreen from './LoginScreen/LoginScreen'
import LoginSequence from './LoginScreen/LoginSequence'
import BlogScreen from './BlogScreen/BlogScreen'
import LoginDropdown from './UserAuth/LoginDropdown'
import UserInfo from './UserAuth/UserInfo'
import { blogPosts, secretBlogPosts, asciiArt, secretAsciiArt } from '@/data/blogData'
import { getAllPosts, getSecretPosts } from '@/lib/sanity.queries'

export default function TerminalBlog() {
  // Clerk authentication
  const { isSignedIn, user } = useUser()
  
  // Screen state
  const [showLogin, setShowLogin] = useState(true)
  const [showBlog, setShowBlog] = useState(false)
  const [showSequence, setShowSequence] = useState(false)
  
  // Blog state
  const [isSecret, setIsSecret] = useState(false)
  const [posts, setPosts] = useState<BlogPostType[]>([])
  const [loading, setLoading] = useState(true)

  const color = isSecret ? '#00ff00' : '#8bafc2'
  
  // Get username from Clerk - prioritize username field
  const username = user?.username || user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user'

  // Apply color theme when blog type changes
  useEffect(() => {
    if (showBlog) {
      applyColorTheme()
    }
  }, [showBlog, isSecret])

  // Fetch posts from Sanity
  useEffect(() => {
    const fetchPosts = async () => {
      if (!showBlog) return
      
      try {
        if (isSecret) {
          // Fetch secret posts from Sanity
          const sanitySecretPosts = await getSecretPosts()
          setPosts(sanitySecretPosts.length > 0 ? sanitySecretPosts : secretBlogPosts)
        } else {
          // Fetch from Sanity
          const sanityPosts = await getAllPosts()
          setPosts(sanityPosts.length > 0 ? sanityPosts : blogPosts)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        // Fallback to static data if Sanity fails
        setPosts(isSecret ? secretBlogPosts : blogPosts)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [showBlog, isSecret])

  const applyColorTheme = () => {
    document.documentElement.style.setProperty('--terminal-color', color)
    
    const elements = document.querySelectorAll(
      'body, .terminal-header, .login-screen, .blog-screen, .ascii-art, input, button, .post-title, .post-meta, .post-content, .system-message, .comment-author, .comment-date, .comment-text'
    )
    elements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.color = color
      }
    })
    
    const buttons = document.querySelectorAll('button')
    buttons.forEach(btn => {
      if (btn instanceof HTMLElement) {
        btn.style.borderColor = color
      }
    })
    
    const cursors = document.querySelectorAll('.typing-cursor-live')
    cursors.forEach(cursor => {
      if (cursor instanceof HTMLElement) {
        cursor.style.backgroundColor = color
      }
    })
  }

  const handleInitialLogin = (password: string) => {
    if (password === '0508') {
      setIsSecret(false)
    } else if (password === 'Winslow') {
      setIsSecret(true)
    }
    
    setShowLogin(false)
    setShowSequence(true)
  }

  const handleSequenceComplete = () => {
    setShowSequence(false)
    setShowBlog(true)
  }

  const handleAddComment = async (postIndex: number, author: string, text: string) => {
    const post = posts[postIndex]
    
    const tempId = `c${Date.now()}`
    
    // Create optimistic comment for immediate UI update with ISO timestamp
    const newComment = {
      id: tempId,
      author,
      date: new Date().toISOString(), // Full ISO timestamp for accurate relative time
      text,
      replies: [],
      _saved: false  // Mark as not saved yet
    }
    
    // Update UI immediately
    const updatedPosts = [...posts]
    if (!updatedPosts[postIndex].comments) {
      updatedPosts[postIndex].comments = []
    }
    updatedPosts[postIndex].comments.push(newComment)
    setPosts(updatedPosts)
    
    // Save to Sanity via API route if post has _id
    if (post._id) {
      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post._id,
            author,
            text,
            isReply: false
          })
        })
        
        if (!response.ok) {
          throw new Error('Failed to save comment')
        }
        
        console.log('Comment saved to Sanity')
        
        // Refetch to get real _key from Sanity
        const sanityPosts = isSecret ? await getSecretPosts() : await getAllPosts()
        const updatedPost = sanityPosts.find(p => p._id === post._id)
        
        if (updatedPost) {
          const finalPosts = [...posts]
          finalPosts[postIndex] = updatedPost
          setPosts(finalPosts)
          console.log('✅ Comment updated with real Sanity _key')
        }
        
      } catch (error) {
        console.error('Error saving comment:', error)
        alert('Failed to save comment. Please try again.')
        // Revert on error
        const revertedPosts = [...posts]
        revertedPosts[postIndex].comments = revertedPosts[postIndex].comments.filter(
          c => c.id !== tempId
        )
        setPosts(revertedPosts)
      }
    }
  }

  const handleAddReply = async (postIndex: number, commentId: string, author: string, text: string) => {
    const post = posts[postIndex]
    
    const tempId = `r${Date.now()}`
    
    // Create optimistic reply for immediate UI update with ISO timestamp
    const newReply = {
      id: tempId,
      author,
      date: new Date().toISOString(), // Full ISO timestamp for accurate relative time
      text,
      replies: [],
      _saved: false  // Mark as not saved yet
    }
    
    const updatedPosts = [...posts]
    const comments = updatedPosts[postIndex].comments
    
    // Recursive function to find and add reply to the correct comment
    const addReplyToComment = (comments: any[]): boolean => {
      for (let comment of comments) {
        if (comment.id === commentId) {
          if (!comment.replies) {
            comment.replies = []
          }
          comment.replies.push(newReply)
          return true
        }
        if (comment.replies && comment.replies.length > 0) {
          if (addReplyToComment(comment.replies)) {
            return true
          }
        }
      }
      return false
    }
    
    addReplyToComment(comments)
    setPosts(updatedPosts)
    
    // Save to Sanity via API route if post has _id
    if (post._id) {
      try {
        // Build the path to the comment's replies array
        // This searches through ALL nested levels and handles both temp IDs and Sanity _keys
        const buildPath = (comments: any[], targetId: string, currentPath: string = 'comments'): string | null => {
          for (let i = 0; i < comments.length; i++) {
            const comment = comments[i]
            
            // Check if this is the target comment (match by id)
            if (comment.id === targetId) {
              // Use the comment's id for the Sanity path (this is the _key after refetch)
              return `${currentPath}[_key=="${comment.id}"].replies`
            }
            
            // Search in nested replies
            if (comment.replies && comment.replies.length > 0) {
              const nestedPath = buildPath(
                comment.replies,
                targetId,
                `${currentPath}[_key=="${comment.id}"].replies`
              )
              if (nestedPath) return nestedPath
            }
          }
          return null
        }
        
        const commentPath = buildPath(post.comments, commentId)
        
        if (commentPath) {
          console.log('Built comment path:', commentPath)
          
          const response = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postId: post._id,
              commentPath,
              author,
              text,
              isReply: true
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to save reply')
          }
          
          console.log('Reply saved to Sanity')
          
          // Refetch to get real _key from Sanity
          const sanityPosts = isSecret ? await getSecretPosts() : await getAllPosts()
          const updatedPost = sanityPosts.find(p => p._id === post._id)
          
          if (updatedPost) {
            const finalPosts = [...posts]
            finalPosts[postIndex] = updatedPost
            setPosts(finalPosts)
            console.log('✅ Reply updated with real Sanity _key')
          }
          
        } else {
          console.error('Could not find comment path for id:', commentId)
          alert('Could not find parent comment. Please refresh and try again.')
        }
      } catch (error) {
        console.error('Error saving reply:', error)
        alert('Failed to save reply. Please try again.')
      }
    }
  }

  return (
    <div className="container">
      <div className="terminal-header">
        <div className="terminal-title">
          BASEMENT
        </div>
      </div>
      
      {showLogin && (
        <LoginScreen onLogin={handleInitialLogin} />
      )}
      
      {showSequence && (
        <div className="login-screen">
          <div id="loginContent">
            <LoginSequence 
              isSecret={isSecret} 
              onComplete={handleSequenceComplete} 
            />
          </div>
        </div>
      )}
      
      {showBlog && (
        <>
          {isSignedIn ? (
            <UserInfo 
              username={username}
              color={color}
            />
          ) : (
            <LoginDropdown 
              color={color}
            />
          )}
          
          {loading ? (
            <div className="system-message" style={{ color, marginTop: '40px' }}>
              Loading posts...
            </div>
          ) : (
            <BlogScreen 
              posts={posts}
              isSecret={isSecret}
              isLoggedIn={isSignedIn || false}
              username={username}
              asciiArt={asciiArt}
              secretAsciiArt={secretAsciiArt}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
            />
          )}
        </>
      )}
    </div>
  )
}