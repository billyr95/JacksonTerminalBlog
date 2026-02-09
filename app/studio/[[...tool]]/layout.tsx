import '../../globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <body className={`studio-body ${inter.className}`} suppressHydrationWarning>
      <style>{`
        .studio-body::before {
          display: none !important;
        }
        .studio-body {
          margin: 0;
          padding: 0;
          background: #fff;
        }
        .studio-body * {
          font-family: ${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }
      `}</style>
      {children}
    </body>
  )
}