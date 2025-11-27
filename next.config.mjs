/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: '1000mb', // or 20mb if you want
  },
};

export default nextConfig;
