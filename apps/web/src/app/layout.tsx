import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'miniERP',
  description: '面向采购、销售、库存与盘点的一体化运营台。',
};

const rootFontVariables = {
  '--font-body-family': '"Inter", "Segoe UI", "PingFang SC", "Hiragino Sans GB", sans-serif',
  '--font-display-family': '"Space Grotesk", "Avenir Next", "PingFang SC", sans-serif',
  '--font-geist-sans': '"Inter", "Segoe UI", "PingFang SC", "Hiragino Sans GB", sans-serif',
  '--font-geist-mono': '"SFMono-Regular", "Menlo", "Monaco", monospace',
  '--font-space-grotesk': '"Space Grotesk", "Avenir Next", "PingFang SC", sans-serif',
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body style={rootFontVariables}>{children}</body>
    </html>
  );
}
