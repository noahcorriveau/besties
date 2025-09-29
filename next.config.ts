/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // disables eslint breaking the build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
