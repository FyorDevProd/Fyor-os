import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
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
  title: 'FYOR AI SERVER OS',
  description: 'Autonomous AI-powered VPS control panel',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="bg-black text-slate-200 antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster 
            theme="dark"
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: 'bg-black/80 backdrop-blur-md border border-cyan-500/30 text-slate-200 font-mono rounded-xl',
                title: 'text-cyan-400 font-bold',
                description: 'text-slate-400',
                error: 'border-rose-500/50 text-rose-400',
                success: 'border-emerald-500/50 text-emerald-400',
                warning: 'border-amber-500/50 text-amber-400',
                info: 'border-blue-500/50 text-blue-400',
              }
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
