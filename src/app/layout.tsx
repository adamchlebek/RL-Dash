import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { BackgroundPolling } from '@/components/BackgroundPolling';
import { Navigation } from '@/components/Navigation';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'sonner';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin']
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin']
});

export const metadata: Metadata = {
    title: 'Rocket League Stats',
    description: 'Track and analyze your Rocket League performance'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
                <Navigation />
                {children}
                <BackgroundPolling />
                <Analytics />
                <Toaster />
            </body>
        </html>
    );
}
