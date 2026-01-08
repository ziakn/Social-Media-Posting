/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'bsky.social',
      },
      {
        protocol: 'https',
        hostname: 'cdn.bsky.app',
      }
    ],
  },
  serverActions: {
    bodySizeLimit: '1000mb', // or 20mb if you want
  },
};

export default nextConfig;
