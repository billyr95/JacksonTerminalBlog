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
          fontSize: '13px',
          lineHeight: '1',
          color,
          whiteSpace: 'pre'
        }}
      >
        {art}
      </div>
    )
  }

  // Normal blog: will be animated via parent
  return (
    <div 
      className="ascii-art"
      id="ascii-art-container"
      style={{ 
        fontSize: '7px',
        lineHeight: '1',
        color
      }}
    />
  )
}
