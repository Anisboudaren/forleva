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
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc'
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com'
      },
      {
        protocol: 'https',
        hostname: 'bhaavyakapur.com'
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com'
      }
    ]
  }
}

export default nextConfig
