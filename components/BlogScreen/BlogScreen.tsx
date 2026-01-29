'use client'

import { useEffect, useRef } from 'react'
import { BlogPost as BlogPostType } from '@/types'
import AsciiArt from './AsciiArt'
import BlogPosts from './BlogPosts'

declare global {
  interface Window {
    gsap: any;
  }
}

interface BlogScreenProps {
  posts: BlogPostType[]
  isSecret: boolean
  isLoggedIn: boolean
  username: string
  asciiArt: string
  secretAsciiArt: string
  onAddComment: (postIndex: number, author: string, text: string) => void
  onAddReply: (postIndex: number, commentId: string, author: string, text: string) => void
}

export default function BlogScreen({ 
  posts, 
  isSecret, 
  isLoggedIn, 
  username, 
  asciiArt,
  secretAsciiArt,
  onAddComment,
  onAddReply
}: BlogScreenProps) {
  
  const color = isSecret ? '#00ff00' : '#8bafc2'
  const artToDisplay = isSecret ? secretAsciiArt : asciiArt
  const hasAnimated = useRef(false)

  useEffect(() => {
    const initArt = async () => {
      if (!isSecret && typeof window !== 'undefined' && window.gsap && !hasAnimated.current) {
        hasAnimated.current = true
        // Animate normal blog ASCII art
        const container = document.getElementById('ascii-art-container')
        if (container && container.children.length === 0) { // Only animate if empty
          const lines = asciiArt.trim().split('\n')
          await typeWriter(container, lines)
        }
      }
    }

    initArt()
  }, [isSecret, asciiArt])

  const typeWriter = async (element: HTMLElement, lines: string[]) => {
    // Create inner wrapper for centering
    const innerWrapper = document.createElement('div')
    innerWrapper.style.textAlign = 'left'
    element.appendChild(innerWrapper)
    
    for (let line of lines) {
      const lineDiv = document.createElement('div')
      lineDiv.className = 'terminal-line animate-text'
      lineDiv.style.color = color
      lineDiv.textContent = ''
      innerWrapper.appendChild(lineDiv)
      
      const cursor = document.createElement('span')
      cursor.className = 'typing-cursor-live'
      cursor.style.backgroundColor = color
      lineDiv.appendChild(cursor)
      
      await new Promise<void>(resolve => {
        let currentText = ''
        const chars = line.split('')
        let charIndex = 0
        
        const typingInterval = setInterval(() => {
          if (charIndex < chars.length) {
            currentText += chars[charIndex]
            lineDiv.textContent = currentText
            lineDiv.appendChild(cursor)
            charIndex++
          } else {
            clearInterval(typingInterval)
            cursor.remove()
            resolve()
          }
        }, 0.5)
      })
      
      if (window.gsap) {
        window.gsap.to(lineDiv, {
          opacity: 1,
          duration: 0.05
        })
      }
      
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  return (
    <div className="blog-screen">
      <div id="blogScreen">
        <AsciiArt 
          art={artToDisplay}
          color={isSecret ? '#ff0000' : '#8bafc2'}
          animated={!isSecret}
        />
        
        <BlogPosts 
          posts={posts}
          color={color}
          isLoggedIn={isLoggedIn}
          username={username}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
        />
      </div>
    </div>
  )
}