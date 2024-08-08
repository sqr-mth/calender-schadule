"use client"
import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from 'react-query';
import Nav from '../components/Nav';
import { type ReactNode } from 'react';
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <html lang="en">
          <body>
            <Nav />
            {children}
          </body>
        </html>
      </QueryClientProvider>
    </RecoilRoot>
  );
}
