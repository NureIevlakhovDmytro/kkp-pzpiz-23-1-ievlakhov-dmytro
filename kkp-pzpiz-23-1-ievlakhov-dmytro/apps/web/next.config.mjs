/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@app/shared'],
  eslint: { dirs: ['src'] },
};
export default nextConfig;
