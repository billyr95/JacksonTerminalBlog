export interface Comment {
  author: string
  date: string
  text: string
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
