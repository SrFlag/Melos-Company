/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logopng.com.br',
      },
      {
        protocol: 'https',
        hostname: 'logodownload.org',
      },
      // Adicionei o Supabase aqui também para garantir que as fotos dos produtos funcionem
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;