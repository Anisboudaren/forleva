import type { NextConfig } from 'next'
import { getCloudflareImageHosts, getCloudflarePublicBaseUrl } from './lib/cloudflare-s3-config'

const cloudflareImageHosts = getCloudflareImageHosts()
const cloudflareR2ImageBase = getCloudflarePublicBaseUrl() ?? ''

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLOUDFLARE_IMAGE_HOSTS: cloudflareImageHosts.join(','),
    NEXT_PUBLIC_CLOUDFLARE_R2_IMAGE_BASE: cloudflareR2ImageBase,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.rareblocks.xyz',
      },
      {
        protocol: 'https',
        hostname: 'd33wubrfki0l68.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'landingfoliocom.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'bhaavyakapur.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      ...cloudflareImageHosts.map((hostname) => ({
        protocol: 'https' as const,
        hostname,
      })),
    ],
  },
}

export default nextConfig
