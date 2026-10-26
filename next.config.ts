import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Caching is opt-in: only functions marked "use cache" keep their results (src/lib/api.ts)
  cacheComponents: true,
  // Every <Image> gets its links from Cloudinary (src is a Cloudinary public ID)
  images: { loader: "custom", loaderFile: "./src/lib/cloudinary-loader.ts" },
}

export default nextConfig
