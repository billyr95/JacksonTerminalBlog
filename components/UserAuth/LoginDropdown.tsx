'use client'

import { useState, useRef, useEffect } from 'react'

interface LoginDropdownProps {
  color: string
  onLogin: (username: string, password: string) => void
}

export default function LoginDropdown({ color, onLogin }: LoginDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const usernameInput = document.getElementById('userLoginUsername') as HTMLInputElement
    const passwordInput = document.getElementById('userLoginPassword') as HTMLInputElement
    
    if (!usernameInput || !passwordInput) return
    
    const username = usernameInput.value.trim()
    const password = passwordInput.value.trim()
    
    if (!username || !password) {
      alert('ERROR: Username and password required')
      return
    }
    
    onLogin(username, password)
    setShowDropdown(false)
    
    // Clear inputs
    usernameInput.value = ''
    passwordInput.value = ''
  }

  return (
    <div className="user-login-container" ref={dropdownRef}>
      <button 
        className="login-toggle"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ color, borderColor: color }}
      >
        [ LOGIN ]
      </button>
      {showDropdown && (
        <div className="login-dropdown" style={{ borderColor: color }}>
          <form onSubmit={handleSubmit}>
            <div className="dropdown-header" style={{ color }}>
              &gt; USER LOGIN
            </div>
            <div className="input-line">
              <span className="prompt-symbol" style={{ color }}>&gt;</span>
              <input 
                type="text" 
                id="userLoginUsername"
                placeholder="username" 
                style={{ color }}
                autoComplete="off"
              />
            </div>
            <div className="input-line">
              <span className="prompt-symbol" style={{ color }}>&gt;</span>
              <input 
                type="password" 
                id="userLoginPassword"
                placeholder="password" 
                style={{ color }}
                autoComplete="off"
              />
            </div>
            <button 
              type="submit"
              className="login-submit"
              style={{ color, borderColor: color }}
            >
              [ AUTHENTICATE ]
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
