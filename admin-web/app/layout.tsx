import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import MainLayout from '@/src/components/MainLayout';

const NOTO_SANS = Noto_Sans_KR({
  weight: ['400', '700', '900'],
  variable: '--font-noto-sans-kr',
  preload: true,
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '키친 매니저 Admin',
  description: '치킨 매니저 Admin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${NOTO_SANS.variable}`}>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
