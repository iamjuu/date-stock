import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BillFlow — Billing Software',
  description: 'Simple billing app with Next.js and MongoDB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}