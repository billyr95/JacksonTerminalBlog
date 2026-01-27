'use client'

interface UserInfoProps {
  username: string
  color: string
  onLogout: () => void
}

export default function UserInfo({ username, color, onLogout }: UserInfoProps) {
  return (
    <div className="user-login-container">
      <div className="user-info">
        <span className="logged-in-user" style={{ color }}>
          USER: {username}
        </span>
        <button 
          className="logout-button"
          onClick={onLogout}
          style={{ color, borderColor: color }}
        >
          [ LOGOUT ]
        </button>
      </div>
    </div>
  )
}
