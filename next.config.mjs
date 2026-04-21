import path from "node:path"
import { fileURLToPath } from "node:url"

/** Directory containing this config file (real app root). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Avoid wrong root when a lockfile exists in a parent directory (e.g. ~/package-lock.json).
    root: projectRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
