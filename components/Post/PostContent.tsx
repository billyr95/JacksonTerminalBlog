'use client'

interface PostContentProps {
  content: string
  color: string
}

export default function PostContent({ content, color }: PostContentProps) {
  return (
    <div className="post-content" style={{ color }}>
      {content}
    </div>
  )
}
