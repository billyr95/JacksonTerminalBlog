'use client'

import { BlogPost as BlogPostType } from '@/types'
import BlogPost from '../Post/BlogPost'

interface BlogPostsProps {
  posts: BlogPostType[]
  color: string
  isLoggedIn: boolean
  username: string
  onAddComment: (postIndex: number, author: string, text: string) => void
  onAddReply: (postIndex: number, commentId: string, author: string, text: string) => void
}

export default function BlogPosts({ 
  posts, 
  color, 
  isLoggedIn, 
  username, 
  onAddComment,
  onAddReply
}: BlogPostsProps) {
  
  return (
    <div id="blogPosts" style={{ marginTop: '40px' }}>
      {posts.map((post, index) => (
        <BlogPost
          key={index}
          post={post}
          postIndex={index}
          color={color}
          isLoggedIn={isLoggedIn}
          username={username}
          onAddComment={onAddComment}
          onAddReply={onAddReply}
        />
      ))}
    </div>
  )
}