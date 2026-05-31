import './globals.css';
import type { ReactNode } from 'react';
import { Onest, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';

const sans = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});
const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata = { title: 'Складський облік', description: 'Управління складом закладу громадського харчування' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
