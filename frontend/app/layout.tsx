import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Workflow Copilot',
  description: 'AI-powered workflow automation with contextual execution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
