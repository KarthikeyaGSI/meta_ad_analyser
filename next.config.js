const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config) => {
    // Exclude the backend folder from being processed by webpack/Turbopack
    config.module.rules.push({
      test: /\\.(js|tsx?)$/,
      exclude: /backend/,
    });
    return config;
  },
};

module.exports = nextConfig;
