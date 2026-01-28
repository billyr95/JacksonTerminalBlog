import '../../globals.css'

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <body className="studio-body" suppressHydrationWarning>
      <style>{`
        .studio-body::before {
          display: none !important;
        }
        .studio-body {
          margin: 0;
          padding: 0;
          background: #fff;
        }
      `}</style>
      {children}
    </body>
  )
}