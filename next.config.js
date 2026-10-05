/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // ページ遷移時に View Transitions API を使う(トップのカード → おみくじ枠のモーフ用)
    viewTransition: true,
  },
}

module.exports = nextConfig
