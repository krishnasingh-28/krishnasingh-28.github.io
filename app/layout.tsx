import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  title: 'Krishna Singh — AI Systems Engineer',
  description:
    'Portfolio of Krishna Singh, an AI Systems Engineer specializing in production AI systems, LLM engineering, retrieval-augmented generation, and intelligent backend architecture.',
  generator: 'v0.app',
  keywords: [
    'AI Systems Engineer',
    'LLM Engineering',
    'RAG',
    'FastAPI',
    'Production AI',
    'AI Agents',
    'Machine Learning',
  ],
  authors: [{ name: 'Krishna Singh' }],
  openGraph: {
    title: 'Krishna Singh — AI Systems Engineer',
    description:
      'Production AI • LLM Engineering • Intelligent Systems. Explore the engineering work of Krishna Singh.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
