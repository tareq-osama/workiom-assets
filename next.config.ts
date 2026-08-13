import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  async redirects() {
    return [
      {
        source: '/browse',
        destination: '/',
        permanent: false,
      },
    ];
  },
  images: {
    // Asset files go through /api/file/[...path] (same-origin proxy — no entry needed).
    // The wildcard pattern covers user-supplied cover image URLs in collections.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
};

export default nextConfig;
