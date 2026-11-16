import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Nav from '@/components/Nav';
import type { ReactNode } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Forma — Personal productivity',
  description: 'Your workspace for plans, focus, and progress.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <Nav />
          <main className="app-main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
