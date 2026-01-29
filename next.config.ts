import type { NextConfig } from "next";

// For GitHub Pages deployment:
// If using a custom domain, set BASE_PATH="" or leave empty
// If using username.github.io/repo-name, BASE_PATH defaults to "/repo-name"
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";

// Allow manual override via BASE_PATH env var
// For custom domain (e.g., rektsafe.com): set BASE_PATH=""
// For project page (e.g., user.github.io/repo): leave unset or set BASE_PATH="/repo"
const basePath =
  process.env.BASE_PATH !== undefined
    ? process.env.BASE_PATH
    : isGithubActions && repoName
      ? `/${repoName}`
      : "";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
