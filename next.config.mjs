/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["motion", "@react-three/drei"]
  }
};

export default nextConfig;
