"use client"

import type { ImageLoaderProps } from "next/image"

const BASE = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`

// Turns a Cloudinary public ID (what the API stores, e.g. "the-sea-explorer-cover") into a
// link that Cloudinary resizes on the fly. next.config.ts sends every <Image> through this,
// and <Image> calls it once per width it offers the browser. A default export, because
// that's what Next's loaderFile expects.
//   f_auto: the best format this browser understands (AVIF, WebP or JPEG)
//   c_limit: shrink to this width, never crop or enlarge
//   q_auto: Cloudinary picks the compression (unless an <Image> sets `quality`)
export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  const changes = ["f_auto", "c_limit", `w_${width}`, `q_${quality ?? "auto"}`]
  return `${BASE}/${changes.join(",")}/${src}`
}
