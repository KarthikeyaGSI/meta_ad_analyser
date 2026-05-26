const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  outputFileTracingRoot: path.join(__dirname, '..'),
};

module.exports = nextConfig;
