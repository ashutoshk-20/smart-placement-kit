/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/coding/:path*',
        destination: 'http://localhost:5001/:path*',   // backend-1
      },
    ];
  },
};

export default nextConfig;
