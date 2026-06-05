import React from 'react';
import './globals.css';
import { ErrorBoundary } from '../client/components/ErrorBoundary';
import Providers from './providers';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Vero — Automated Meta Ads Audits & Monitoring',
  description: 'Automatically detect wasted Meta ad spend, audience fatigue, rising costs, and missed scaling opportunities before they impact profitability.',
  openGraph: {
    title: 'Vero — Automated Meta Ads Audits & Monitoring',
    description: 'Automatically detect wasted Meta ad spend, audience fatigue, rising costs, and missed scaling opportunities.',
    url: 'https://vero.ai',
    siteName: 'Vero',
    images: [{ url: 'https://vero.ai/og-image.png', width: 1200, height: 630, alt: 'Vero Dashboard' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vero — Automated Meta Ads Audits & Monitoring',
    description: 'Detect wasted Meta ad spend automatically.',
    image: 'https://vero.ai/twitter-image.png',
  },
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Vero',
    url: 'https://vero.yourdomain.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://vero.yourdomain.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Vero',
      logo: 'https://vero.yourdomain.com/logo.png'
    }
  };

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
