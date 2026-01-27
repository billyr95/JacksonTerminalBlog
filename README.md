# Terminal Blog - Refactored Component Architecture

A retro terminal-style blog with modular component architecture, ready for Clerk and Sanity integration.

## 🎯 Refactored Architecture

### Component Structure

```
components/
├── TerminalBlog.tsx          # Main orchestrator (~150 lines)
├── LoginScreen/
│   ├── LoginScreen.tsx       # Initial password screen
│   └── LoginSequence.tsx     # Loading animations
├── BlogScreen/
│   ├── BlogScreen.tsx        # Blog container
│   ├── AsciiArt.tsx          # ASCII art display
│   └── BlogPosts.tsx         # Posts container
├── Post/
│   ├── BlogPost.tsx          # Single post
│   ├── PostHeader.tsx        # Title, date, author
│   ├── PostContent.tsx       # Post body
│   └── Comments/
│       ├── CommentItem.tsx   # Single comment
│       ├── CommentList.tsx   # All comments
│       └── AddComment.tsx    # Comment form
└── UserAuth/
    ├── LoginDropdown.tsx     # Login UI
    └── UserInfo.tsx          # Logged-in display

data/
└── blogData.ts               # Static blog data

types/
└── index.ts                  # TypeScript interfaces
```

## ✨ Benefits of This Architecture

### 1. **Separation of Concerns**
- Each component has a single responsibility
- Easy to locate and modify specific features
- No more 600+ line files

### 2. **Reusability**
- `BlogPost`, `CommentItem` can be used anywhere
- Auth components isolated for easy Clerk integration
- Post components ready for Sanity data

### 3. **Maintainability**
- Changes to comments don't affect posts
- Easy to add new features
- Simple to debug issues

### 4. **Testability**
- Each component can be tested independently
- Mock props easily
- Clear dependencies

### 5. **Ready for Integration**
- **Clerk**: Just replace `UserAuth` components
- **Sanity**: Pass CMS data to `BlogPost` components
- **API Routes**: Easy to add data fetching

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Key Files Explained

### Main Orchestrator
**`components/TerminalBlog.tsx`**
- Manages overall state
- Coordinates screen transitions
- Handles authentication flow
- ~150 lines (down from 600+!)

### User Authentication
**`components/UserAuth/LoginDropdown.tsx`**
- Login form UI
- Ready to replace with Clerk `<SignIn />`

**`components/UserAuth/UserInfo.tsx`**
- Display logged-in user
- Ready to use Clerk's `<UserButton />`

### Blog Posts
**`components/Post/BlogPost.tsx`**
- Single post component
- Receives post data via props
- Perfect for mapping Sanity CMS data

### Comments System
**`components/Post/Comments/`**
- `CommentItem.tsx` - Displays one comment
- `CommentList.tsx` - Maps over comments array
- `AddComment.tsx` - Comment form with auth state

### Data Layer
**`data/blogData.ts`**
- Static blog posts (temporary)
- Will be replaced with Sanity queries

**`types/index.ts`**
- TypeScript interfaces
- Shared across all components
- Matches Sanity schema structure

## 🔧 Next Steps

### Integrating Clerk

1. Install Clerk:
```bash
npm install @clerk/nextjs
```

2. Replace in `components/TerminalBlog.tsx`:
```typescript
import { useUser } from '@clerk/nextjs'

const { isSignedIn, user } = useUser()
// Use instead of local state
```

3. Replace `LoginDropdown.tsx` with:
```typescript
import { SignInButton } from '@clerk/nextjs'
```

### Integrating Sanity

1. Install Sanity client:
```bash
npm install @sanity/client
```

2. Fetch posts in `TerminalBlog.tsx`:
```typescript
const [posts, setPosts] = useState<BlogPostType[]>([])

useEffect(() => {
  const fetchPosts = async () => {
    const data = await client.fetch('*[_type == "post"]')
    setPosts(data)
  }
  fetchPosts()
}, [])
```

3. Posts automatically flow to all child components!

## 🎨 Customization

### Adding a New Post Field

1. Update `types/index.ts`:
```typescript
export interface BlogPost {
  // ... existing fields
  tags?: string[]  // Add new field
}
```

2. Update `Post/BlogPost.tsx` to display tags

3. That's it! Type safety everywhere.

### Adding a New Comment Feature

1. Edit `AddComment.tsx` for UI
2. Update comment handler in `TerminalBlog.tsx`
3. Changes isolated to comment components

## 🎯 Component Props Reference

### BlogPost
```typescript
{
  post: BlogPostType           // Post data
  postIndex: number             // Array index
  color: string                 // Theme color
  isLoggedIn: boolean          // Auth state
  username: string             // Current user
  onAddComment: (index, author, text) => void
}
```

### AddComment
```typescript
{
  postId: string               // Unique ID
  color: string                // Theme color
  isLoggedIn: boolean         // Auth state
  username: string            // Current user
  onAddComment: (author, text) => void
}
```

## 📝 License

MIT

## 🎉 Credits

- Refactored modular architecture
- Ready for Clerk authentication
- Ready for Sanity CMS
- Built with Next.js 14
- TypeScript throughout
