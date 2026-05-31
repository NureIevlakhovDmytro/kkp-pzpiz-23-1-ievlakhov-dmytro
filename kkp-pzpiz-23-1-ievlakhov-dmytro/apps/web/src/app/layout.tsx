import './globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'Warehouse', description: 'Catering warehouse management' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
