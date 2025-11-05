/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
    },
    allowedDevOrigins: [
        'dev.gunn.live',
        'mini-one-iota.vercel.app',
    ],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'profile.line-scdn.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.line-scdn.net',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig
