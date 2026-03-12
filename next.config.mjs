/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // نتجاهل أخطاء ESLint أثناء البناء على Vercel لتجنّب فشل النشر بسبب إعداد تفاعلي
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://integrate.api.nvidia.com https://generativelanguage.googleapis.com",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

