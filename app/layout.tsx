import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
export const metadata: Metadata = { title: 'TG Installations Maroc', description: 'Pilotage des installations Têtes de Gondole au Maroc.' };
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
