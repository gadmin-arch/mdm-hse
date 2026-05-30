import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'HSE Performance Dashboard',
  description: 'HSE Performance Dashboard - Safety is our priority',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo k3.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: 'logo k3.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: 'logo k3.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#071a30]">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
