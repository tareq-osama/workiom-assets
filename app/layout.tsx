import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import Navbar from '@/components/navbar';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-ibm-plex-arabic',
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Workiom Assets Library',
  description:
    'Centralized digital asset management for Workiom — logos, brand guidelines, templates, campaign materials, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexArabic.variable} light h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <TooltipProvider delay={300}>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </TooltipProvider>
      </body>
    </html>
  );
}
