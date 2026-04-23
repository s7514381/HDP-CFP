import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true, // 嚴格模式
  trailingSlash: true, // 將所有路由結尾添加斜線
  // 開發模式不要使用 output: export，會導致熱更新失效
  ...(isProduction ? {
    output: "export", // 靜態導出（只在正式環境啟用）
    distDir: "../../out/cfp",
  } : {}),
  images: {
    unoptimized: true, //禁用圖片優化
  },
};

export default nextConfig;
