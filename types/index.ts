export interface Comment {
  id: string
  author: string
  date: string
  text: string
  replies?: Comment[]
  _saved?: boolean
}

export interface BlogPost {
  _id?: string
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