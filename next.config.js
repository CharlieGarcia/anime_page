module.exports = {
  transpilePackages: ['@mui/material-nextjs'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.kitsu.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'media.kitsu.app',
        port: ''
      }
    ]
  }
};
