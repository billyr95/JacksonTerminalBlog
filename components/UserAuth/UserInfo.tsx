'use client'

import { UserButton } from '@clerk/nextjs'

interface UserInfoProps {
  username: string
  color: string
}

export default function UserInfo({ username, color }: UserInfoProps) {
  return (
    <div className="user-login-container">
      <div className="user-info">
        <span className="logged-in-user" style={{ color }}>
          USER: {username}
        </span>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            }
          }}
        />
      </div>
    </div>
  )
}