/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
