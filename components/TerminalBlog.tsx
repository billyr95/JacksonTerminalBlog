'use client'

import { useState, useEffect } from 'react'
import { BlogPost as BlogPostType } from '@/types'
import LoginScreen from './LoginScreen/LoginScreen'
import LoginSequence from './LoginScreen/LoginSequence'
import BlogScreen from './BlogScreen/BlogScreen'
import LoginDropdown from './UserAuth/LoginDropdown'
import UserInfo from './UserAuth/UserInfo'
import { blogPosts, secretBlogPosts, asciiArt, secretAsciiArt } from '@/data/blogData'

export default function TerminalBlog() {
  // Screen state
  const [showLogin, setShowLogin] = useState(true)
  const [showBlog, setShowBlog] = useState(false)
  const [showSequence, setShowSequence] = useState(false)
  
  // Blog state
  const [isSecret, setIsSecret] = useState(false)
  const [posts, setPosts] = useState<BlogPostType[]>(blogPosts)
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  const color = isSecret ? '#00ff00' : '#8bafc2'

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

  const handleUserLogin = (username: string, password: string) => {
    // For now, accept any username/password
    // This will be replaced with Clerk authentication
    setIsLoggedIn(true)
    setUsername(username)
  }

  const handleUserLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
  }

  const handleAddComment = (postIndex: number, author: string, text: string) => {
    const newComment = {
      author,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      text
    }
    
    const updatedPosts = [...posts]
    if (!updatedPosts[postIndex].comments) {
      updatedPosts[postIndex].comments = []
    }
    updatedPosts[postIndex].comments.push(newComment)
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
          {isLoggedIn ? (
            <UserInfo 
              username={username}
              color={color}
              onLogout={handleUserLogout}
            />
          ) : (
            <LoginDropdown 
              color={color}
              onLogin={handleUserLogin}
            />
          )}
          
          <BlogScreen 
            posts={posts}
            isSecret={isSecret}
            isLoggedIn={isLoggedIn}
            username={username}
            asciiArt={asciiArt}
            secretAsciiArt={secretAsciiArt}
            onAddComment={handleAddComment}
          />
        </>
      )}
    </div>
  )
}
