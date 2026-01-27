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
}

export default function BlogPost({ 
  post, 
  postIndex, 
  color, 
  isLoggedIn, 
  username, 
  onAddComment 
}: BlogPostProps) {
  
  const handleAddComment = (author: string, text: string) => {
    onAddComment(postIndex, author, text)
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
      {post.heroImage && (
        <img 
          src={post.heroImage} 
          alt={post.title} 
          className="post-hero" 
        />
      )}
      
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
