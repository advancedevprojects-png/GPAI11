import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'NEXUS STEM AI Visualizer',
  description: 'No-cost local-first STEM visualization workspace',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
