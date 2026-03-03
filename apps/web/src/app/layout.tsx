import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';

import './globals.css';

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body-family',
  display: 'swap',
});

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display-family',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'miniERP',
  description: '面向采购、销售、库存与盘点的一体化运营台。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
