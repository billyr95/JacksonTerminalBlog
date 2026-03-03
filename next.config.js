/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'basementload.ing',
          },
        ],
        destination: 'https://wired-world.uk/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig