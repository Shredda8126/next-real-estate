/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'placehold.co'],
  },
  serverRuntimeConfig: {
    // Increase timeout for API routes
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
      responseLimit: false,
    },
  },
  // Increase fetch timeout
  async fetchTimeout(timeout) {
    return timeout || 30000; // 30 seconds
  },
};

export default nextConfig;
