# Component Map & Data Flow

## 📊 Component Hierarchy

```
TerminalBlog (main orchestrator)
├── LoginScreen
│   └── (creates DOM elements dynamically)
│
├── LoginSequence
│   └── (creates loading animations)
│
├── BlogScreen
│   ├── AsciiArt
│   └── BlogPosts
│       └── BlogPost (mapped for each post)
│           ├── PostHeader
│           ├── PostContent
│           ├── CommentList
│           │   └── CommentItem (mapped for each comment)
│           └── AddComment
│
└── UserAuth (conditional)
    ├── LoginDropdown (if not logged in)
    └── UserInfo (if logged in)
```

## 🔄 State Flow

### Global State (in TerminalBlog)
```typescript
// Screen Management
showLogin: boolean       → Controls LoginScreen visibility
showBlog: boolean        → Controls BlogScreen visibility
showSequence: boolean    → Controls LoginSequence visibility

// Blog Configuration
isSecret: boolean        → Determines theme (blue vs green)
posts: BlogPostType[]    → Current blog posts

// User Authentication
isLoggedIn: boolean      → User auth state
username: string         → Current username
```

### Props Down, Events Up

**Data flows DOWN via props:**
```
TerminalBlog
  ↓ posts[], isLoggedIn, username
BlogScreen
  ↓ posts[], color, isLoggedIn, username
BlogPosts
  ↓ post, color, isLoggedIn, username
BlogPost
  ↓ comments[], color, isLoggedIn, username
CommentList / AddComment
```

**Events flow UP via callbacks:**
```
AddComment
  ↑ onAddComment(author, text)
BlogPost
  ↑ onAddComment(postIndex, author, text)
BlogPosts
  ↑ onAddComment(postIndex, author, text)
BlogScreen
  ↑ onAddComment(postIndex, author, text)
TerminalBlog (updates posts state)
```

## 🎯 Component Responsibilities

### TerminalBlog (Main Orchestrator)
**Responsibilities:**
- Screen navigation (Login → Sequence → Blog)
- Global state management
- Auth state (temporary, will be Clerk)
- Post data management (temporary, will be Sanity)
- Comment handling

**Does NOT:**
- Render UI directly (delegates to children)
- Handle animations (delegates to child components)
- Style elements (uses child components)

### LoginScreen
**Responsibilities:**
- Render initial password screen
- Typing animations for messages
- Password validation
- Emit login event with password

**Props IN:**
- `onLogin(password)`

**Props OUT:**
- None (creates own DOM)

### LoginSequence
**Responsibilities:**
- Animated loading sequence
- Different sequences for normal/secret
- Scroll management during sequence
- Emit completion event

**Props IN:**
- `isSecret: boolean`
- `onComplete()`

**Props OUT:**
- None (creates own DOM)

### BlogScreen
**Responsibilities:**
- Container for blog content
- Manage ASCII art animation
- Pass data to child components

**Props IN:**
- `posts[]`, `isSecret`, `isLoggedIn`, `username`
- `asciiArt`, `secretAsciiArt`
- `onAddComment()`

**Renders:**
- `<AsciiArt />`, `<BlogPosts />`

### BlogPosts
**Responsibilities:**
- Map over posts array
- Render each BlogPost

**Props IN:**
- `posts[]`, `color`, `isLoggedIn`, `username`
- `onAddComment()`

**Renders:**
- `<BlogPost />` for each post

### BlogPost
**Responsibilities:**
- Single post container
- Compose post parts (header, content, comments)
- Handle comment addition for this post

**Props IN:**
- `post`, `postIndex`, `color`
- `isLoggedIn`, `username`
- `onAddComment(postIndex, author, text)`

**Renders:**
- `<PostHeader />`, `<PostContent />`
- `<CommentList />`, `<AddComment />`

### AddComment
**Responsibilities:**
- Comment input form
- Username handling (logged in vs guest)
- Validation
- Emit new comment

**Props IN:**
- `postId`, `color`, `isLoggedIn`, `username`
- `onAddComment(author, text)`

**State:**
- `commentText`, `guestUsername` (local only)

### UserAuth Components

**LoginDropdown:**
- Login form UI
- Dropdown state management
- Close on outside click
- Emit login event

**UserInfo:**
- Display logged-in user
- Logout button
- Simple presentation component

## 🔌 Integration Points

### For Clerk Integration

Replace in `TerminalBlog.tsx`:
```typescript
// BEFORE
const [isLoggedIn, setIsLoggedIn] = useState(false)
const [username, setUsername] = useState('')

// AFTER
import { useUser } from '@clerk/nextjs'
const { isSignedIn, user } = useUser()
const isLoggedIn = isSignedIn
const username = user?.username || ''
```

Replace `LoginDropdown.tsx` entirely with:
```typescript
import { SignInButton } from '@clerk/nextjs'
```

### For Sanity Integration

Replace in `TerminalBlog.tsx`:
```typescript
// BEFORE
const [posts, setPosts] = useState<BlogPostType[]>(blogPosts)

// AFTER
const [posts, setPosts] = useState<BlogPostType[]>([])

useEffect(() => {
  async function fetchPosts() {
    const data = await sanityClient.fetch(`
      *[_type == "post"] {
        title, date, author, content, 
        "heroImage": heroImage.asset->url,
        "comments": comments[]
      }
    `)
    setPosts(data)
  }
  fetchPosts()
}, [])
```

## 💡 Key Design Patterns

### 1. Container/Presenter Pattern
- `BlogPosts` = Container (manages array)
- `BlogPost` = Presenter (displays one item)

### 2. Controlled Components
- `AddComment` manages its own input state
- Sends completed data up via callback
- Parent doesn't micromanage input fields

### 3. Single Responsibility
- Each component does ONE thing
- Easy to modify without breaking others
- Clear boundaries

### 4. Props Interface Stability
- Props are clearly typed
- Easy to see what component needs
- TypeScript enforces correctness

## 🚀 Adding New Features

### Add a "Like" Feature to Posts

1. Update `types/index.ts`:
```typescript
export interface BlogPost {
  // ... existing fields
  likes: number
}
```

2. Add button in `PostHeader.tsx`:
```typescript
<button onClick={() => onLike(postIndex)}>
  👍 {post.likes}
</button>
```

3. Handle in `TerminalBlog.tsx`:
```typescript
const handleLike = (postIndex: number) => {
  const updatedPosts = [...posts]
  updatedPosts[postIndex].likes += 1
  setPosts(updatedPosts)
}
```

4. Pass down through props chain

### Add Rich Text Editor to Comments

1. Install editor package
2. Replace `<textarea>` in `AddComment.tsx`
3. That's it! Isolated change.

## 📝 File Size Comparison

**Before Refactor:**
- `TerminalBlog.tsx`: ~600 lines

**After Refactor:**
- `TerminalBlog.tsx`: ~150 lines
- `BlogPost.tsx`: ~60 lines
- `AddComment.tsx`: ~80 lines
- `CommentList.tsx`: ~25 lines
- etc.

**Result:** Much easier to navigate and maintain!
