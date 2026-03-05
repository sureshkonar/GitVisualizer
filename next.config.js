/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/GitVisualizer',
  assetPrefix: '/GitVisualizer/',
  images: { unoptimized: true }
};

module.exports = nextConfig;
