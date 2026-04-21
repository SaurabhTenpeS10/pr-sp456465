import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// Updated metadata configuration
import { Toaster } from 'react-hot-toast';
import './globals.css';

import { AuthProvider } from '@/lib/auth/context';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ThemeProvider } from '@/lib/providers/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PromptCache AI - Smart LLM Response Caching',
  description: 'Reduce AI API costs and improve response times with intelligent caching for OpenAI GPT and Google Gemini',
  keywords: ['AI', 'LLM', 'caching', 'OpenAI', 'GPT', 'Gemini', 'cost optimization'],
  authors: [{ name: 'PromptCache AI Team' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'PromptCache AI - Smart LLM Response Caching',
    description: 'Reduce AI API costs and improve response times with intelligent caching',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptCache AI - Smart LLM Response Caching',
    description: 'Reduce AI API costs and improve response times with intelligent caching',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0ea5e9' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-full`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <div className="h-full">
                {children}
              </div>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
