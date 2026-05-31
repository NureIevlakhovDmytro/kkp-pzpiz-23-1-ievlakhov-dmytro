import './globals.css';
import type { ReactNode } from 'react';
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';

const display = Archivo({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display' });
const sans = IBM_Plex_Sans({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' });

export const metadata = { title: 'Складський облік', description: 'Управління складом закладу громадського харчування' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} ${mono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
