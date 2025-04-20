import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { BackgroundPolling } from '@/components/BackgroundPolling';
import { Navigation } from '@/components/Navigation';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/providers/ThemeProvider';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
});

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
                <ThemeProvider>
                    <Navigation />
                    {children}
                    <BackgroundPolling />
                    <Analytics />
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
