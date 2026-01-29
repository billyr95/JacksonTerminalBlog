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
      <div 
        className="ascii-art"
        style={{ 
          fontSize: '3.5px',
          lineHeight: '1',
          color,
          whiteSpace: 'pre',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div style={{ textAlign: 'left' }}>
          {art}
        </div>
      </div>
    )
  }

  // Normal blog: will be animated via parent
  return (
    <div 
      className="ascii-art"
      id="ascii-art-container"
      style={{ 
        fontSize: '3.5px',
        lineHeight: '1',
        color,
        display: 'flex',
        justifyContent: 'center'
      }}
    />
  )
}