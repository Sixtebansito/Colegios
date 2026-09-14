import { Merriweather, Roboto } from 'next/font/google'

export const institutionalSerif = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
})

export const institutionalSans = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-institutional-sans',
  display: 'swap',
})
