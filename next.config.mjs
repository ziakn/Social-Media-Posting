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
      },
    ],
  },

  // Allow Stripe on the server
  serverExternalPackages: ['stripe'],
};

export default nextConfig;
