import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trackr - Link Shortener & Analytics',
  description: 'Create shortened links with full click tracking and analytics for sponsors.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  )
}
