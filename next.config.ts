import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Caching is opt-in: only functions marked "use cache" keep their results (src/lib/api.ts)
  cacheComponents: true,
  // A <Link> prefetches one shared "shell" per route, not one copy per link. Becomes the only
  // behavior in Next 17 (docs: guides/adopting-partial-prefetching)
  partialPrefetching: true,
  // Every <Image> gets its links from Cloudinary (src is a Cloudinary public ID)
  images: { loader: "custom", loaderFile: "./src/lib/cloudinary-loader.ts" },
  // Dev only: the terminal prints every fetch the Next server makes (e.g. to the API), with
  // its full URL, status and time. The browser's Network tab can't see these
  logging: { fetches: { fullUrl: true } },
}

export default nextConfig
