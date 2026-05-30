import React from 'react';
import './globals.css';
import { ErrorBoundary } from '../client/components/ErrorBoundary';
import Providers from './providers';

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
  return (
    <html lang="en">
      <body>
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
