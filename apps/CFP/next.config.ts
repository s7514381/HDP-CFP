import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // 嚴格模式
  trailingSlash: true, // 將所有路由結尾添加斜線
  basePath: process.env.NODE_ENV === "production" ? "/hospital/app" : "", // 設定應用程序的基礎路徑為 /hospital（正式環境）
  assetPrefix: process.env.NODE_ENV === "production" ? "/hospital/app" : "", // 設定靜態資源的路徑前綴為 /hospital（正式環境）
  output: "export", // 靜態導出
  distDir: "../../out/cfp",
  images: {
    unoptimized: true, //禁用圖片優化
  },
};

export default nextConfig;
