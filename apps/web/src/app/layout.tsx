import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'HAPPI',
  description:
    'Culturally relevant mental-health care for Africans at home and abroad.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
