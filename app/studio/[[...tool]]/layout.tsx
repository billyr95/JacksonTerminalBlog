import '../../globals.css'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          body::before {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}