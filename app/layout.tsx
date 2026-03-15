import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { Toaster } from 'sonner';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'FYOR AI SERVER OS',
    template: '%s | FYOR OS'
  },
  description: 'Autonomous AI-powered VPS control panel and server management system.',
  keywords: ['VPS', 'Control Panel', 'AI Server Management', 'Docker', 'Hosting'],
  authors: [{ name: 'FYOR OS Team' }],
  openGraph: {
    title: 'FYOR AI SERVER OS',
    description: 'Autonomous AI-powered VPS control panel and server management system.',
    url: 'https://fyor-os.com',
    siteName: 'FYOR OS',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FYOR AI SERVER OS',
    description: 'Autonomous AI-powered VPS control panel and server management system.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://fyor-os.com',
    languages: {
      'en-US': 'https://fyor-os.com/en',
      'id-ID': 'https://fyor-os.com/id',
      'zh-CN': 'https://fyor-os.com/zh',
    },
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="bg-white text-slate-900 dark:bg-black dark:text-slate-200 antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast: 'bg-white dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-cyan-500/30 text-slate-900 dark:text-slate-200 font-sans dark:font-mono rounded-xl',
                  title: 'text-blue-600 dark:text-cyan-400 font-bold',
                  description: 'text-slate-500 dark:text-slate-400',
                  error: 'border-rose-500/50 text-rose-600 dark:text-rose-400',
                  success: 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400',
                  warning: 'border-amber-500/50 text-amber-600 dark:text-amber-400',
                  info: 'border-blue-500/50 text-blue-600 dark:text-blue-400',
                }
              }}
            />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
