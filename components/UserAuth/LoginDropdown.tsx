'use client'

import { SignInButton } from '@clerk/nextjs'

interface LoginDropdownProps {
  color: string
}

export default function LoginDropdown({ color }: LoginDropdownProps) {
  return (
    <div className="user-login-container">
      <SignInButton mode="modal">
        <button 
          className="login-toggle"
          style={{ color, borderColor: color }}
        >
          [ LOGIN ]
        </button>
      </SignInButton>
    </div>
  )
}