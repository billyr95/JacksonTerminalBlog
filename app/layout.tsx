import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WIRED WORLD',
  description: 'A retro terminal-style blog',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'WIRED WORLD',
    description: 'A retro terminal-style blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WIRED WORLD',
    description: 'A retro terminal-style blog',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          card: {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
            fontFamily: inter.style.fontFamily,
          },
          formFieldInput: {
            backgroundColor: '#ffffff',
            borderColor: '#d1d5db',
            color: '#000000',
            fontFamily: inter.style.fontFamily,
          },
          formButtonPrimary: {
            backgroundColor: '#8bafc2',
            color: '#000',
            fontFamily: inter.style.fontFamily,
            '&:hover': {
              backgroundColor: '#6a8fa2',
            },
          },
          formFieldLabel: {
            fontFamily: inter.style.fontFamily,
          },
          headerTitle: {
            fontFamily: inter.style.fontFamily,
          },
          headerSubtitle: {
            fontFamily: inter.style.fontFamily,
          },
          socialButtonsBlockButton: {
            fontFamily: inter.style.fontFamily,
          },
          footer: {
            fontFamily: inter.style.fontFamily,
            '& + div': {
              marginTop: '1rem',
            }
          }
        },
      }}
      localization={{
        signUp: {
          start: {
            subtitle: "By providing your phone number, you agree to Laylo's Terms and Conditions and Privacy Policy.",
          },
        },
      }}
    >
      <html lang="en">
        <head>
          {/* GSAP Library */}
          <Script 
            src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
            strategy="beforeInteractive"
          />
          <Script 
            src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js"
            strategy="beforeInteractive"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}