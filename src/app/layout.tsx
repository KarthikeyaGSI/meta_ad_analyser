import React from 'react';
import './globals.css';
import { ErrorBoundary } from '../client/components/ErrorBoundary';
import Providers from './providers';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata = {
  title: 'Vero - Meta Ads Analytics SaaS',
  description: 'Premium Decision Intelligence Dashboard for Meta Ads scaling, fatigue identification and budget anomaly auditing.',
  openGraph: {
    title: 'Vero - Meta Ads Analytics SaaS',
    description: 'Premium Decision Intelligence Dashboard for Meta Ads scaling, fatigue identification and budget anomaly auditing.',
    url: 'https://yourdomain.com',
    siteName: 'Vero',
    images: [{ url: 'https://yourdomain.com/og-image.png', width: 1200, height: 630, alt: 'Vero Dashboard' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vero - Meta Ads Analytics SaaS',
    description: 'Premium Decision Intelligence Dashboard for Meta Ads scaling, fatigue identification and budget anomaly auditing.',
    image: 'https://yourdomain.com/twitter-image.png',
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
    <html lang="en" className={`${outfit.variable}`}>
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
