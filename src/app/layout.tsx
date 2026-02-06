import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Top Escolhas da Net - Jogue nas Loterias Online',
  description: 'Jogue nas maiores loterias do Brasil e do mundo. Mega-Sena, Lotofácil, Powerball, Mega Millions, EuroMilhões e muito mais!',
  keywords: 'loteria online, mega-sena, powerball, mega millions, euromilhões, lotofácil, apostar online',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
