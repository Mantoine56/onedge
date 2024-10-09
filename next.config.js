/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
}

module.exports = {
  ...nextConfig,
  webpack: (config, { isServer }) => {
    if (isServer) {
      const dotenv = require('dotenv');
      const envPath = require('path').resolve(process.cwd(), '.env.local');
      console.log('Loading environment variables from:', envPath);
      const env = dotenv.config({ path: envPath }).parsed;
      console.log('Loaded environment variables:', Object.keys(env || {}));
    }
    return config;
  },
};