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
        
        // Wait for custom font to load before animating
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready
        }
        
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
    
    const LINES_AT_ONCE = 5
    const targetDuration = 5000 // 5 seconds total
    
    // Process lines in batches of 5
    for (let batchStart = 0; batchStart < lines.length; batchStart += LINES_AT_ONCE) {
      const batchEnd = Math.min(batchStart + LINES_AT_ONCE, lines.length)
      const batchLines = lines.slice(batchStart, batchEnd)
      
      // Create divs for this batch
      const batchDivs: HTMLElement[] = []
      for (let line of batchLines) {
        const lineDiv = document.createElement('div')
        lineDiv.className = 'terminal-line'
        lineDiv.style.color = color
        lineDiv.style.opacity = '1'
        lineDiv.textContent = ''
        innerWrapper.appendChild(lineDiv)
        batchDivs.push(lineDiv)
      }
      
      // Calculate timing for this batch
      const longestLineInBatch = Math.max(...batchLines.map(l => l.length))
      const totalCharsInAllBatches = lines.reduce((sum, line) => sum + line.length, 0)
      const charsInThisBatch = batchLines.reduce((sum, line) => sum + line.length, 0)
      
      // Proportional time for this batch based on character count
      const batchDuration = (charsInThisBatch / totalCharsInAllBatches) * targetDuration
      const msPerChar = batchDuration / longestLineInBatch
      
      // Type all lines in this batch simultaneously
      await new Promise<void>((resolve) => {
        let charIndex = 0
        
        const interval = setInterval(() => {
          if (charIndex >= longestLineInBatch) {
            clearInterval(interval)
            resolve()
            return
          }
          
          // Update each line in the batch
          batchLines.forEach((line, lineIdx) => {
            if (charIndex < line.length) {
              batchDivs[lineIdx].textContent = line.substring(0, charIndex + 1)
            }
          })
          
          charIndex++
        }, msPerChar)
      })
    }
  }

  return (
    <div className="blog-screen">
      <div id="blogScreen">
        <AsciiArt 
          art={artToDisplay}
          color={isSecret ? '#00ff00' : '#8bafc2'}
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