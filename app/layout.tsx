import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Social Media Hub',
  description: 'Task manager for social media managers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-h-screen pb-16 md:pb-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
