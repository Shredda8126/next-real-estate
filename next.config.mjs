/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'placehold.co'],
  },
  serverRuntimeConfig: {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
      responseLimit: false,
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@/models'] = config.resolve.alias['@/models'] || './models';
    return config;
  },
};

export default nextConfig;
