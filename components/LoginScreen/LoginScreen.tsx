'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    gsap: any;
  }
}

interface LoginScreenProps {
  onLogin: (password: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gsap && !hasInitialized.current) {
      hasInitialized.current = true
      initLoginScreen()
    }
  }, [])

  const initLoginScreen = async () => {
    const loginContent = document.getElementById('loginContent')
    if (!loginContent) return
    loginContent.innerHTML = ''

    await new Promise(resolve => setTimeout(resolve, 200))
    const systemMessages = [
      'SYSTEM READY',
      'Initializing secure connection...',
      'Connection to Basement established.',
      '',
      'Enter authorization code to continue:',
      'Hint: Need the code? Text us. (617)618-5821'
    ]
    
    for (let msg of systemMessages) {
      const msgDiv = document.createElement('div')
      msgDiv.className = msg === '' ? 'animate-text' : 'system-message animate-text'
      msgDiv.textContent = msg
      loginContent.appendChild(msgDiv)
      
      if (msg !== '') {
        msgDiv.textContent = ''
        const cursor = document.createElement('span')
        cursor.className = 'typing-cursor-live'
        msgDiv.appendChild(cursor)
        
        await new Promise<void>(resolve => {
          let currentText = ''
          const chars = msg.split('')
          let charIndex = 0
          
          const typingInterval = setInterval(() => {
            if (charIndex < chars.length) {
              currentText += chars[charIndex]
              msgDiv.textContent = currentText
              msgDiv.appendChild(cursor)
              charIndex++
            } else {
              clearInterval(typingInterval)
              cursor.remove()
              resolve()
            }
          }, 10 + Math.random() * 15)
        })
      }
      
      if (window.gsap) {
        window.gsap.to(msgDiv, {
          opacity: 1,
          duration: 0.1
        })
      }
      
      await new Promise(resolve => setTimeout(resolve, msg === '' ? 100 : 150))
    }

    // Add "want more" button with riddle
    await new Promise(resolve => setTimeout(resolve, 200))
    const wantMoreContainer = document.createElement('div')
    wantMoreContainer.style.marginTop = '15px'
    
    const wantMoreBtn = document.createElement('button')
    wantMoreBtn.textContent = '[ WANT MORE? ]'
    wantMoreBtn.className = 'animate-text'
    wantMoreBtn.style.fontSize = '12px'
    wantMoreBtn.style.padding = '4px 8px'
    
    const riddleDiv = document.createElement('div')
    riddleDiv.className = 'system-message'
    riddleDiv.style.display = 'none'
    riddleDiv.style.marginTop = '10px'
    riddleDiv.style.fontSize = '14px'
    riddleDiv.style.lineHeight = '1.6'
    riddleDiv.innerHTML = `Live more connected. Ground yourself.<br>We need to be inspired. Your signal was never lost, you just need to be re-_____<br>Enter your answer into the password input`
    
    wantMoreBtn.onclick = () => {
      if (riddleDiv.style.display === 'none') {
        riddleDiv.style.display = 'block'
        wantMoreBtn.textContent = '[ HIDE ]'
      } else {
        riddleDiv.style.display = 'none'
        wantMoreBtn.textContent = '[ WANT MORE? ]'
      }
    }
    
    wantMoreContainer.appendChild(wantMoreBtn)
    wantMoreContainer.appendChild(riddleDiv)
    loginContent.appendChild(wantMoreContainer)
    
    if (window.gsap) {
      window.gsap.to(wantMoreBtn, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
    }

    await new Promise(resolve => setTimeout(resolve, 200))
    const inputDiv = document.createElement('div')
    inputDiv.className = 'input-line animate-text'
    inputDiv.innerHTML = `
      <span class="prompt-symbol">></span>
      <input type="password" id="passwordInput" placeholder="password" autofocus>
    `
    loginContent.appendChild(inputDiv)
    if (window.gsap) {
      window.gsap.to(inputDiv, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
    }

    await new Promise(resolve => setTimeout(resolve, 150))
    const button = document.createElement('button')
    button.onclick = () => handleLogin()
    button.textContent = '[ AUTHENTICATE ]'
    button.className = 'animate-text'
    loginContent.appendChild(button)
    if (window.gsap) {
      window.gsap.to(button, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      })
    }

    const errorDiv = document.createElement('div')
    errorDiv.id = 'errorMessage'
    errorDiv.className = 'error hidden'
    loginContent.appendChild(errorDiv)

    const passwordInput = document.getElementById('passwordInput') as HTMLInputElement
    if (passwordInput) {
      passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleLogin()
        }
      })
    }
  }

  const handleLogin = () => {
    const passwordInput = document.getElementById('passwordInput') as HTMLInputElement
    const errorMessage = document.getElementById('errorMessage')
    
    if (!passwordInput) return
    
    if (passwordInput.value === '0508' || passwordInput.value === 'wired') {
      onLogin(passwordInput.value)
    } else {
      if (errorMessage) {
        errorMessage.textContent = 'ERROR: Invalid authorization code. Access denied.'
        errorMessage.classList.remove('hidden')
      }
      passwordInput.value = ''
    }
  }

  return (
    <div className="login-screen">
      <div id="loginContent"></div>
    </div>
  )
}