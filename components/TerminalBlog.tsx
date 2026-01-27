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

export default function TerminalBlog() {
  // Clerk authentication
  const { isSignedIn, user } = useUser()
  
  // Screen state
  const [showLogin, setShowLogin] = useState(true)
  const [showBlog, setShowBlog] = useState(false)
  const [showSequence, setShowSequence] = useState(false)
  
  // Blog state
  const [isSecret, setIsSecret] = useState(false)
  const [posts, setPosts] = useState<BlogPostType[]>(blogPosts)

  const color = isSecret ? '#00ff00' : '#8bafc2'
  
  // Get username from Clerk - prioritize username field
  const username = user?.username || user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user'

  // Apply color theme when blog type changes
  useEffect(() => {
    if (showBlog) {
      applyColorTheme()
    }
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
    if (password === 'terminal123') {
      setIsSecret(false)
      setPosts(blogPosts)
    } else if (password === 'Winslow') {
      setIsSecret(true)
      setPosts(secretBlogPosts)
    }
    
    setShowLogin(false)
    setShowSequence(true)
  }

  const handleSequenceComplete = () => {
    setShowSequence(false)
    setShowBlog(true)
  }

  const handleAddComment = (postIndex: number, author: string, text: string) => {
    const newComment = {
      id: `c${Date.now()}`,
      author,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      text,
      replies: []
    }
    
    const updatedPosts = [...posts]
    if (!updatedPosts[postIndex].comments) {
      updatedPosts[postIndex].comments = []
    }
    updatedPosts[postIndex].comments.push(newComment)
    setPosts(updatedPosts)
  }

  const handleAddReply = (postIndex: number, commentId: string, author: string, text: string) => {
    const newReply = {
      id: `r${Date.now()}`,
      author,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      text,
      replies: []
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
  }

  return (
    <div className="container">
      <div className="terminal-header">
        <div className="terminal-title">
          TERMINAL BLOG SYSTEM v1.0 | SECURE ACCESS
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
        </>
      )}
    </div>
  )
}