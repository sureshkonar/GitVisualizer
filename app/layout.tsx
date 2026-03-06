import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Git Visualizer',
  description: 'Learn Git visually with interactive simulations and challenges.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
