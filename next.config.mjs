/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["better-auth", "kysely", "@better-auth/kysely-adapter"],
};

export default nextConfig;
