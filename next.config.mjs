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
    // Resolve aliases for models
    config.resolve.alias['@/models'] = './models';
    
    // Prevent duplicate module imports
    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new config.plugins.DefinePlugin({
        'process.env.NEXT_IGNORE_DUPLICATE_MODULES': JSON.stringify('true')
      })
    ];

    // Add fallback for node core modules
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      punycode: false
    };

    return config;
  },
  
  // Transpile specific packages if needed
  transpilePackages: ['mongoose'],
};

export default nextConfig;
