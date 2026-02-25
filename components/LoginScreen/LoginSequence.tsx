'use client'

import { useEffect, useRef } from 'react'

interface LoginSequenceProps {
  isSecret: boolean
  onComplete: () => void
}

export default function LoginSequence({ isSecret, onComplete }: LoginSequenceProps) {
  const hasRun = useRef(false)
  
  useEffect(() => {
    if (!hasRun.current && typeof window !== 'undefined') {
      hasRun.current = true
      setTimeout(runSequence, 100)
    }
  }, [])
  
  const runSequence = async () => {
    const loginContent = document.getElementById('loginContent')
    if (!loginContent) return
    
    loginContent.innerHTML = ''
    
    const scrollToBottom = () => {
      const loginScreen = document.querySelector('.login-screen')
      if (loginScreen) {
        loginScreen.scrollTop = loginScreen.scrollHeight
      }
      window.scrollTo(0, document.body.scrollHeight)
    }
    
    if (isSecret) {
      // Secret blog dramatic sequence
      await runSecretSequence(loginContent, scrollToBottom)
    } else {
      // Normal blog simple loading
      await runNormalSequence(loginContent)
    }
    
    onComplete()
  }

  const runNormalSequence = async (container: HTMLElement) => {
    const loadingDiv = document.createElement('div')
    loadingDiv.className = 'system-message'
    loadingDiv.style.fontSize = '18px'
    loadingDiv.style.marginTop = '100px'
    loadingDiv.textContent = 'Initializing'
    container.appendChild(loadingDiv)
    
    let dots = 0
    const ellipsesInterval = setInterval(() => {
      dots = (dots + 1) % 4
      loadingDiv.textContent = 'Initializing' + '.'.repeat(dots)
    }, 300)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    clearInterval(ellipsesInterval)
  }

  const runSecretSequence = async (container: HTMLElement, scrollToBottom: () => void) => {
    const greenColor = '#00ff00'
    const defaultColor = '#8bafc2'
    
    // Step 1: Initializing
    const loadingDiv = document.createElement('div')
    loadingDiv.className = 'system-message'
    loadingDiv.style.fontSize = '18px'
    loadingDiv.style.marginTop = '20px'
    loadingDiv.textContent = 'Initializing'
    container.appendChild(loadingDiv)
    scrollToBottom()
    
    let dots = 0
    const ellipsesInterval = setInterval(() => {
      dots = (dots + 1) % 4
      loadingDiv.textContent = 'Initializing' + '.'.repeat(dots)
    }, 300)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    clearInterval(ellipsesInterval)
    loadingDiv.textContent = 'Initializing...'
    
    // Step 2: Initialize Success (green)
    await addMessage(container, 'Initialize Success', greenColor, scrollToBottom, 800)
    
    // Step 3: Connecting to Basement Database
    await addLoadingMessage(container, 'Connecting to Basement Database', defaultColor, scrollToBottom, 1500)
    
    // Step 4: Connection Established (green)
    await addMessage(container, 'Connection Established', greenColor, scrollToBottom, 800)
    
    // Step 5: Encryption initialized
    await addMessage(container, 'Encryption initialized', defaultColor, scrollToBottom, 600)
    
    // Step 6: Random gibberish (data stream)
    await addGibberish(container, scrollToBottom)
    
    // Step 7: Configuring
    await addLoadingMessage(container, 'Configuring', defaultColor, scrollToBottom, 1500)
    
    // Step 8: Configuration Success (green)
    await addMessage(container, 'Configuration Success', greenColor, scrollToBottom, 1000)
  }

  const addMessage = async (
    container: HTMLElement, 
    text: string, 
    color: string, 
    scrollToBottom: () => void,
    delay: number
  ) => {
    const msg = document.createElement('div')
    msg.className = 'system-message'
    msg.style.color = color
    msg.style.fontSize = '18px'
    msg.style.marginTop = '20px'
    msg.textContent = text
    container.appendChild(msg)
    scrollToBottom()
    
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  const addLoadingMessage = async (
    container: HTMLElement,
    baseText: string,
    color: string,
    scrollToBottom: () => void,
    duration: number
  ) => {
    const msg = document.createElement('div')
    msg.className = 'system-message'
    msg.style.fontSize = '18px'
    msg.style.marginTop = '20px'
    msg.style.color = color
    msg.textContent = baseText
    container.appendChild(msg)
    scrollToBottom()
    
    let dots = 0
    const interval = setInterval(() => {
      dots = (dots + 1) % 4
      msg.textContent = baseText + '.'.repeat(dots)
    }, 300)
    
    await new Promise(resolve => setTimeout(resolve, duration))
    clearInterval(interval)
    msg.textContent = baseText + '...'
  }

  const addGibberish = async (container: HTMLElement, scrollToBottom: () => void) => {
    const gibberishDiv = document.createElement('div')
    gibberishDiv.className = 'system-message'
    gibberishDiv.style.fontSize = '14px'
    gibberishDiv.style.marginTop = '20px'
    gibberishDiv.style.color = '#00ff00'
    gibberishDiv.style.wordBreak = 'break-all'
    gibberishDiv.style.maxWidth = '900px'
    container.appendChild(gibberishDiv)
    scrollToBottom()
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
    const gibberishDuration = 4000
    const gibberishInterval = 20
    const gibberishUpdates = gibberishDuration / gibberishInterval
    
    for (let i = 0; i < gibberishUpdates; i++) {
      await new Promise(resolve => setTimeout(resolve, gibberishInterval))
      let text = ''
      for (let j = 0; j < (i + 1) * 10; j++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      gibberishDiv.textContent = text
      if (i % 5 === 0) scrollToBottom()
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return null
}