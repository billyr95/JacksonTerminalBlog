import { client } from './sanity.client'
import { BlogPost } from '@/types'

// Fetch all blog posts
export async function getAllPosts(): Promise<BlogPost[]> {
  const query = `*[_type == "post"] | order(date desc) {
    _id,
    title,
    author,
    "date": date,
    content,
    "heroImage": heroImage.asset->url,
    "comments": comments[]{
      _key,
      author,
      text,
      "date": date,
      "replies": replies[]{
        _key,
        author,
        text,
        "date": date,
        "replies": replies[]{
          _key,
          author,
          text,
          "date": date
        }
      }
    }
  }`
  
const posts = await client.fetch(query)
  
  // Recursive function to transform comments at any nesting level
  const transformComments = (comments: any[]): any[] => {
    if (!comments || comments.length === 0) return []
    
    return comments.map((comment: any) => ({
      id: comment._key,
      author: comment.author,
      text: comment.text,
      date: new Date(comment.date).toISOString().split('T')[0].replace(/-/g, '.'),
      replies: transformComments(comment.replies || [])
    }))
  }
  
  // Transform Sanity data to match our BlogPost type
  return posts.map((post: any) => ({
    _id: post._id,
    title: post.title,
    date: new Date(post.date).toISOString().split('T')[0].replace(/-/g, '.'),
    author: post.author,
    content: post.content,
    heroImage: post.heroImage || '/images/unnamed.jpg',
    comments: transformComments(post.comments || [])
  }))
}

// Fetch all secret blog posts
export async function getSecretPosts(): Promise<BlogPost[]> {
  const query = `*[_type == "secretPost"] | order(date desc) {
    _id,
    title,
    author,
    "date": date,
    content,
    "heroImage": heroImage.asset->url,
    "comments": comments[]{
      _key,
      author,
      text,
      "date": date,
      "replies": replies[]{
        _key,
        author,
        text,
        "date": date,
        "replies": replies[]{
          _key,
          author,
          text,
          "date": date
        }
      }
    }
  }`
  
const posts = await client.fetch(query)
  
  // Recursive function to transform comments at any nesting level
  const transformComments = (comments: any[]): any[] => {
    if (!comments || comments.length === 0) return []
    
    return comments.map((comment: any) => ({
      id: comment._key,
      author: comment.author,
      text: comment.text,
      date: new Date(comment.date).toISOString().split('T')[0].replace(/-/g, '.'),
      replies: transformComments(comment.replies || [])
    }))
  }
  
  // Transform Sanity data to match our BlogPost type
  return posts.map((post: any) => ({
    _id: post._id,
    title: post.title,
    date: new Date(post.date).toISOString().split('T')[0].replace(/-/g, '.'),
    author: post.author,
    content: post.content,
    heroImage: post.heroImage || '/images/unnamed.jpg',
    comments: transformComments(post.comments || [])
  }))
}

// Add a new comment to a post
export async function addCommentToPost(
  postId: string,
  author: string,
  text: string
): Promise<void> {
  const newComment = {
    _key: `c${Date.now()}`,
    _type: 'comment',
    author,
    text,
    date: new Date().toISOString(),
    replies: []
  }

  await client
    .patch(postId)
    .setIfMissing({ comments: [] })
    .append('comments', [newComment])
    .commit()
}

// Add a reply to a comment (recursive function to handle nested replies)
export async function addReplyToComment(
  postId: string,
  commentPath: string,
  author: string,
  text: string
): Promise<void> {
  const newReply = {
    _key: `r${Date.now()}`,
    _type: 'comment',
    author,
    text,
    date: new Date().toISOString(),
    replies: []
  }

  await client
    .patch(postId)
    .setIfMissing({ [commentPath]: [] })
    .append(commentPath, [newReply])
    .commit()
}

// Helper function to build the path to a nested comment's replies array
export function buildCommentPath(
  comments: any[],
  targetCommentId: string,
  currentPath: string = 'comments'
): string | null {
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i]
    
    if (comment.id === targetCommentId || comment._key === targetCommentId) {
      return `${currentPath}[_key=="${comment._key}"].replies`
    }
    
    if (comment.replies && comment.replies.length > 0) {
      const nestedPath = buildCommentPath(
        comment.replies,
        targetCommentId,
        `${currentPath}[_key=="${comment._key}"].replies`
      )
      if (nestedPath) return nestedPath
    }
  }
  
  return null
}