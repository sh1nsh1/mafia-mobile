import { Oswald, Inter, JetBrains_Mono } from 'next/font/google';

import type { Metadata } from 'next';
import './globals.css';

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mafia',
  description: 'Game',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ru"
      className={`${oswald.variable} ${inter.variable} ${jetBrainsMono.variable} antialiased`}
    >
      <body className="bg-white dark:bg-black">{children}</body>
    </html>
  );
}
