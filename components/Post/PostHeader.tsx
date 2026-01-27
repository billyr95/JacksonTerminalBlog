'use client'

interface PostHeaderProps {
  title: string
  date: string
  author: string
  color: string
}

export default function PostHeader({ title, date, author, color }: PostHeaderProps) {
  return (
    <div className="post-header">
      <div className="post-title" style={{ color }}>
        &gt; {title}
      </div>
      <div className="post-meta" style={{ color }}>
        Date: {date} | Author: {author}
      </div>
    </div>
  )
}
