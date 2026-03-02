'use client'

import { useState, useRef, useEffect } from 'react'

interface MusicPlayerProps {
  audioUrl: string
  title?: string
  color: string
}

export default function MusicPlayer({ audioUrl, title, color }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isLoaded, setIsLoaded] = useState(false)

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
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return

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

  // Generate ASCII progress bar
  const generateProgressBar = (percent: number, width: number = 30): string => {
    const filled = Math.floor((percent / 100) * width)
    const empty = width - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
  }

  // Generate volume bar
  const generateVolumeBar = (vol: number, width: number = 8): string => {
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
        maxWidth: '600px',
        fontFamily: "'CustomFont', 'Courier New', monospace"
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Header */}
      <div style={{ 
        color, 
        fontSize: '12px', 
        marginBottom: '10px',
        borderBottom: `1px solid ${color}`,
        paddingBottom: '8px'
      }}>
        &gt; AUDIO PLAYER {title && `// ${title}`}
      </div>

      {/* Main Controls Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px',
        marginBottom: '10px'
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!isLoaded}
          style={{
            backgroundColor: 'transparent',
            border: `1px solid ${color}`,
            color,
            padding: '8px 12px',
            cursor: isLoaded ? 'pointer' : 'not-allowed',
            fontFamily: "'CustomFont', 'Courier New', monospace",
            fontSize: '14px',
            minWidth: '80px',
            opacity: isLoaded ? 1 : 0.5
          }}
          onMouseEnter={(e) => {
            if (isLoaded) {
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
          fontSize: '12px',
          fontFamily: "'CustomFont', 'Courier New', monospace",
          minWidth: '90px'
        }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ 
          color, 
          fontSize: '10px', 
          marginBottom: '4px' 
        }}>
          PROGRESS:
        </div>
        <div
          onClick={handleSeek}
          style={{
            cursor: 'pointer',
            backgroundColor: '#111',
            padding: '5px 8px',
            border: `1px solid ${color}33`,
            userSelect: 'none'
          }}
        >
          <span style={{ 
            color, 
            fontSize: '12px',
            letterSpacing: '1px',
            fontFamily: "'CustomFont', 'Courier New', monospace"
          }}>
            [{generateProgressBar(progressPercent)}]
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ 
          color, 
          fontSize: '10px'
        }}>
          VOL:
        </div>
        <div
          onClick={handleVolumeChange}
          style={{
            cursor: 'pointer',
            backgroundColor: '#111',
            padding: '5px 8px',
            border: `1px solid ${color}33`,
            userSelect: 'none'
          }}
        >
          <span style={{ 
            color, 
            fontSize: '12px',
            letterSpacing: '1px',
            fontFamily: "'CustomFont', 'Courier New', monospace"
          }}>
            [{generateVolumeBar(volume)}]
          </span>
        </div>
        <div style={{ 
          color, 
          fontSize: '10px'
        }}>
          {Math.round(volume * 100)}%
        </div>
      </div>

      {/* Status Line */}
      <div style={{ 
        color: color + '88', 
        fontSize: '10px', 
        marginTop: '10px',
        borderTop: `1px solid ${color}33`,
        paddingTop: '8px'
      }}>
        STATUS: {!isLoaded ? 'LOADING...' : isPlaying ? 'PLAYING' : 'READY'}
      </div>
    </div>
  )
}