import type { NextConfig } from "next";
import { execSync } from "child_process";

let lastCommitTime = "Not Available";
try {
  lastCommitTime = execSync('git log -1 --date=format:"%B %d, %Y, %H:%M %Z" --format=%cd')
    .toString()
    .trim();
} catch {
  lastCommitTime =
    new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " (Build Time)";
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : "";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],

  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              port: "",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  env: {
    NEXT_PUBLIC_LAST_UPDATE: lastCommitTime,
  },
};

export default nextConfig;
