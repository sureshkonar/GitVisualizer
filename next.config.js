/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/git-visualizer',
  assetPrefix: '/git-visualizer/',
  images: { unoptimized: true }
};

module.exports = nextConfig;
