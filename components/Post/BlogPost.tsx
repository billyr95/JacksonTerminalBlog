'use client'

import { BlogPost as BlogPostType } from '@/types'
import PostHeader from './PostHeader'
import PostContent from './PostContent'
import CommentList from './Comments/CommentList'
import AddComment from './Comments/AddComment'

interface BlogPostProps {
  post: BlogPostType
  postIndex: number
  color: string
  isLoggedIn: boolean
  username: string
  onAddComment: (postIndex: number, author: string, text: string) => void
  onAddReply: (postIndex: number, commentId: string, author: string, text: string) => void
}

export default function BlogPost({ 
  post, 
  postIndex, 
  color, 
  isLoggedIn, 
  username, 
  onAddComment,
  onAddReply
}: BlogPostProps) {
  
  const handleAddComment = (author: string, text: string) => {
    onAddComment(postIndex, author, text)
  }
  
  const handleReply = (commentId: string, author: string, text: string) => {
    onAddReply(postIndex, commentId, author, text)
  }

  // Helper function to extract YouTube video ID
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Helper function to extract Vimeo video ID
  const getVimeoId = (url: string): string | null => {
    const regExp = /vimeo\.com\/(\d+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  // Determine what media to show (priority: videoUrl > heroVideo > heroImage)
  const renderMedia = () => {
    // 1. Check for embedded video URL (YouTube, Vimeo)
    if (post.videoUrl) {
      const youtubeId = getYouTubeId(post.videoUrl)
      if (youtubeId) {
        return (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '1px solid #444'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      }

      const vimeoId = getVimeoId(post.videoUrl)
      if (vimeoId) {
        return (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '1px solid #444'
              }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      }
    }

    // 2. Check for uploaded video file
    if (post.heroVideo) {
      return (
        <video
          controls
          style={{
            width: 'auto',
            height: 'auto',
            maxHeight: '600px',
            objectFit: 'cover',
            marginBottom: '20px',
            border: '1px solid #444',
            filter: 'contrast(1.2) brightness(0.9)'
          }}
        >
          <source src={post.heroVideo} type="video/mp4" />
          <source src={post.heroVideo} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      )
    }

    // 3. Default to hero image (with optional link)
    if (post.heroImage) {
      const imageElement = (
        <img 
          src={post.heroImage} 
          alt={post.title}
          className="post-hero"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            marginBottom: '20px',
            border: '1px solid #444',
            filter: 'contrast(1.2) brightness(0.9)',
            cursor: post.heroImageLink ? 'pointer' : 'default'
          }}
        />
      )

      // Wrap in link if heroImageLink exists
      if (post.heroImageLink) {
        return (
          <a 
            href={post.heroImageLink} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'block', textDecoration: 'none' }}
          >
            {imageElement}
          </a>
        )
      }

      return imageElement
    }

    return null
  }

  return (
    <div 
      className="blog-post" 
      style={{ 
        opacity: 0, 
        animation: 'fadeIn 0.3s forwards',
        borderLeftColor: color 
      }}
    >
      {renderMedia()}
      
      <PostHeader 
        title={post.title}
        date={post.date}
        author={post.author}
        color={color}
      />
      
      <PostContent 
        content={post.content}
        color={color}
      />
      
      <CommentList 
        comments={post.comments}
        color={color}
        isLoggedIn={isLoggedIn}
        username={username}
        onReply={handleReply}
      />
      
      <AddComment 
        postId={`post-${postIndex}`}
        color={color}
        isLoggedIn={isLoggedIn}
        username={username}
        onAddComment={handleAddComment}
      />
    </div>
  )
}