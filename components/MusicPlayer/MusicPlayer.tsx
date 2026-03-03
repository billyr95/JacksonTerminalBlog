'use client'

import { useState, useRef, useEffect } from 'react'

interface MusicPlayerProps {
  audioUrl: string
  title?: string
  color: string
  postId?: string
}

export default function MusicPlayer({ audioUrl, title, color, postId }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isLoaded, setIsLoaded] = useState(false)
  const [listenCount, setListenCount] = useState(0)
  const [isOverloaded, setIsOverloaded] = useState(false)
  const [isLoadingCount, setIsLoadingCount] = useState(true)
  const hasCountedPlay = useRef(false)
  
  const MAX_LISTENS = 30000

  // Fetch global play count on mount
  useEffect(() => {
    const fetchPlayCount = async () => {
      if (!postId) {
        setIsLoadingCount(false)
        return
      }

      try {
        const response = await fetch(`/api/plays?postId=${postId}`)
        if (response.ok) {
          const data = await response.json()
          setListenCount(data.playCount || 0)
          if (data.playCount >= MAX_LISTENS) {
            setIsOverloaded(true)
          }
        }
      } catch (error) {
        console.error('Error fetching play count:', error)
      } finally {
        setIsLoadingCount(false)
      }
    }

    fetchPlayCount()
  }, [postId])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoaded(true)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      hasCountedPlay.current = false
    }

    const handlePlay = async () => {
      // Count a listen when playback starts (only once per play session)
      if (!hasCountedPlay.current && !isOverloaded && postId) {
        hasCountedPlay.current = true
        
        // Optimistically update the UI
        const newCount = listenCount + 1
        setListenCount(newCount)
        
        // Check if we've hit the limit
        if (newCount >= MAX_LISTENS) {
          setIsOverloaded(true)
          audio.pause()
          setIsPlaying(false)
        }

        // Save to Sanity
        try {
          const response = await fetch('/api/plays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId })
          })
          
          if (response.ok) {
            const data = await response.json()
            // Update with the actual count from server
            setListenCount(data.playCount)
            if (data.playCount >= MAX_LISTENS) {
              setIsOverloaded(true)
              audio.pause()
              setIsPlaying(false)
            }
          }
        } catch (error) {
          console.error('Error incrementing play count:', error)
        }
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
    }
  }, [listenCount, isOverloaded, postId])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    // Don't allow play if overloaded
    if (isOverloaded) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration || isOverloaded) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const newTime = (clickX / width) * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const newVolume = Math.max(0, Math.min(1, clickX / width))
    
    audio.volume = newVolume
    setVolume(newVolume)
  }

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '00:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  // Generate ASCII progress bar - shorter width
  const generateProgressBar = (percent: number, width: number = 20): string => {
    const filled = Math.floor((percent / 100) * width)
    const empty = width - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
  }

  // Generate volume bar
  const generateVolumeBar = (vol: number, width: number = 6): string => {
    const filled = Math.floor(vol * width)
    const empty = width - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
  }

  return (
    <div 
      style={{
        backgroundColor: '#0a0a0a',
        border: `1px solid ${color}`,
        padding: '15px',
        marginBottom: '20px',
        maxWidth: '400px',
        width: '100%',
        fontFamily: "'CustomFont', 'Courier New', monospace",
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Header */}
      <div style={{ 
        color, 
        fontSize: '10px', 
        marginBottom: '10px',
        borderBottom: `1px solid ${color}`,
        paddingBottom: '8px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        &gt; AUDIO PLAYER {title && `// ${title}`}
      </div>

      {/* Listen Counter */}
      <div style={{ 
        color, 
        fontSize: '11px', 
        marginBottom: '10px',
        fontFamily: "'CustomFont', 'Courier New', monospace"
      }}>
        PLAYS: {isLoadingCount ? '...' : `${listenCount}/${MAX_LISTENS}`}
      </div>

      {/* Main Controls Row - Button and Time on same line */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '10px',
        marginBottom: '10px'
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!isLoaded || isOverloaded}
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${color}`,
            color,
            padding: '6px 10px',
            cursor: isLoaded && !isOverloaded ? 'pointer' : 'not-allowed',
            fontFamily: "'CustomFont', 'Courier New', monospace",
            fontSize: '11px',
            opacity: isLoaded && !isOverloaded ? 1 : 0.5,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (isLoaded && !isOverloaded) {
              e.currentTarget.style.backgroundColor = color
              e.currentTarget.style.color = '#000'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = color
          }}
        >
          {isPlaying ? '[ ■ STOP ]' : '[ ▶ PLAY ]'}
        </button>

        {/* Time Display */}
        <div style={{ 
          color, 
          fontSize: '11px',
          fontFamily: "'CustomFont', 'Courier New', monospace",
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ 
          color, 
          fontSize: '9px', 
          marginBottom: '4px' 
        }}>
          PROGRESS:
        </div>
        <div
          onClick={handleSeek}
          style={{
            cursor: isOverloaded ? 'not-allowed' : 'pointer',
            backgroundColor: '#111',
            padding: '5px 8px',
            border: `1px solid ${color}33`,
            userSelect: 'none',
            opacity: isOverloaded ? 0.5 : 1,
            overflow: 'hidden'
          }}
        >
          <span style={{ 
            color, 
            fontSize: '10px',
            letterSpacing: '0px',
            fontFamily: "'CustomFont', 'Courier New', monospace",
            display: 'block',
            overflow: 'hidden'
          }}>
            [{generateProgressBar(progressPercent)}]
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          color, 
          fontSize: '9px',
          flexShrink: 0
        }}>
          VOL:
        </div>
        <div
          onClick={handleVolumeChange}
          style={{
            cursor: 'pointer',
            backgroundColor: '#111',
            padding: '4px 6px',
            border: `1px solid ${color}33`,
            userSelect: 'none'
          }}
        >
          <span style={{ 
            color, 
            fontSize: '10px',
            letterSpacing: '0px',
            fontFamily: "'CustomFont', 'Courier New', monospace"
          }}>
            [{generateVolumeBar(volume)}]
          </span>
        </div>
        <div style={{ 
          color, 
          fontSize: '9px'
        }}>
          {Math.round(volume * 100)}%
        </div>
      </div>

      {/* Status Line */}
      <div style={{ 
        color: color + '88', 
        fontSize: '9px', 
        marginTop: '10px',
        borderTop: `1px solid ${color}33`,
        paddingTop: '8px'
      }}>
        STATUS: {!isLoaded ? 'LOADING...' : isOverloaded ? 'OVERLOADED' : isPlaying ? 'PLAYING' : 'READY'}
      </div>

      {/* Overload Error Message */}
      {isOverloaded && (
        <div style={{
          color: '#ff0000',
          fontSize: '10px',
          marginTop: '10px',
          fontFamily: "'CustomFont', 'Courier New', monospace",
          textTransform: 'lowercase'
        }}>
          failed to play song. system overload
        </div>
      )}
    </div>
  )
}