import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.rareblocks.xyz'
      },
      {
        protocol: 'https',
        hostname: 'd33wubrfki0l68.cloudfront.net'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'landingfoliocom.imgix.net'
      }
    ]
  }
}

export default nextConfig
