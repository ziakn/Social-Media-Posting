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

  // Allow Stripe and ffmpeg on the server
  serverExternalPackages: [
    'stripe',
    'fluent-ffmpeg',
    '@ffmpeg-installer/ffmpeg',
    '@ffprobe-installer/ffprobe'
  ],
};

export default nextConfig;
