import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Tamil } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-tamil',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Thunai AI (துணை AI) - Tamil Nadu Welfare Schemes Assistant',
  description: 'Tamil-first, voice-friendly assistant for Tamil Nadu welfare and government schemes eligibility.',
  keywords: ['Tamil Nadu schemes', 'துணை AI', 'Thunai AI', 'KMUT', 'PM Kisan', 'Pudhumai Penn', 'Government Welfare TN'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0B6623',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ta" className={`${inter.variable} ${notoTamil.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col font-tamil">
        {children}
      </body>
    </html>
  );
}

