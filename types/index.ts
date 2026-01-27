export interface Comment {
  id: string
  author: string
  date: string
  text: string
  replies?: Comment[]
}

export interface BlogPost {
  title: string
  date: string
  author: string
  content: string
  heroImage: string
  comments: Comment[]
}

export interface UserAuth {
  isLoggedIn: boolean
  username: string
}