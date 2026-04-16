/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
    outputFileTracingIncludes: {
      '/api/parse-nobu-pdf': ['./scripts/**/*', './node_modules/pdfjs-dist/**/*'],
    },
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/manifest.json", destination: "/api/manifest" },
        { source: "/ServiceWorker.js", destination: "/api/service-worker" },
      ],
    };
  },
};

module.exports = nextConfig;
