'use client'

interface AsciiArtProps {
  art: string
  color: string
  animated?: boolean
  onAnimationComplete?: () => void
}

export default function AsciiArt({ 
  art, 
  color, 
  animated = false,
  onAnimationComplete 
}: AsciiArtProps) {
  
  if (!animated) {
    // Secret blog: render instantly
    return (
      <a 
        href="https://www.basementisaband.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          textDecoration: 'none',
          display: 'block',
          cursor: 'pointer'
        }}
      >
        <div 
          className="ascii-art"
          style={{ 
            lineHeight: '1',
            color,
            whiteSpace: 'pre',
            display: 'flex',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ textAlign: 'left' }}>
            {art}
          </div>
        </div>
      </a>
    )
  }

  // Normal blog: will be animated via parent
  return (
    <a 
      href="https://www.basementisaband.com/" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ 
        textDecoration: 'none',
        display: 'block',
        cursor: 'pointer'
      }}
    >
      <div 
        className="ascii-art"
        id="ascii-art-container"
        style={{ 
          lineHeight: '1',
          color,
          display: 'flex',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      />
    </a>
  )
}