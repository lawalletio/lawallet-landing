/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/.well-known/lnurlp/:path*',
        destination: 'https://beta.lawallet.io/.well-known/lnurlp/:path*',
      },
      {
        source: '/.well-known/nostr.json',
        destination: 'https://beta.lawallet.io/.well-known/nostr.json',
      },
    ]
  },
}

export default nextConfig
