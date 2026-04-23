---
name: npm_build
description: Next.js 專案建置與發佈流程（適用於 apps/CFP）
---

# npm_build

Next.js 專案使用 `output: "export"` 靜態導出時的建置與發佈流程。

## 適用情境

- 發佈 `apps/CFP` 專案至正式環境（`.env.production`）
- 執行 `npm run build` 建置靜態檔案

## 前置檢查

### 1. 確認環境變數

檢查 `apps/CFP/.env.production` 檔案內容，確保包含必要變數：

```env
NEXT_PUBLIC_API_URL="https://devcfp.ahop.com.tw:8890/api"
NEXT_PUBLIC_VENDOR_URL="https://devscm.ahop.com.tw"
```

### 2. 確認 next.config.ts 設定

檢查 `apps/CFP/next.config.ts`：

```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  basePath: process.env.NODE_ENV === "production" ? "" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "" : "",
  output: "export",           // 靜態導出
  distDir: "../../out/cfp",   // 輸出目錄
  images: { unoptimized: true },
};
```

### 3. 檢查必備檔案

確認 `apps/CFP/src/lib/apiProxy.ts` 存在並包含必要導出：

```ts
export const API_PROXY_PATH = "/api";
export function buildBackendUrl(controller: string, action: string): string {
    return `${API_URL}/${controller}/${action}`;
}
```

### 4. 移除不相容的 API 路由

**靜態導出模式下不支援動態 API 路由**，如有以下檔案需刪除：

```
apps/CFP/src/app/api/[controller]/[action]/route.ts
```

刪除指令：

```bash
cmd /c "rd /s /q apps/CFP/src/app/api"
```

## 建置步驟

### 執行建置

```bash
cd apps/CFP
npm run build
```

### 驗證輸出

建置成功後，檢查 `out/cfp/` 目錄是否已建立：

```bash
Get-ChildItem -Path out/cfp
```

預期輸出应包含 26 個頁面（HTML 檔案）。

## 發佈方式

將 `out/cfp/` 目錄下的所有檔案部署至 web server，設定路徑為 `/hospital/app`。

## 常見錯誤處理

| 錯誤訊息 | 解決方案 |
|----------|----------|
| `basePath has to be either an empty string or a path prefix` | 將 `basePath` 設為 `/hospital/app`，不能是 `/` |
| `export buildBackendUrl doesn't exist` | 建立 `src/lib/apiProxy.ts` 並導出 `buildBackendUrl` |
| `Page "/api/[controller]/[action]" is missing "generateStaticParams()"` | 刪除 `src/app/api/` 目錄（靜態導出不支援動態路由） |

## 環境別名說明

| 環境 | 使用指令 |
|------|----------|
| 開發環境 | `npm run dev`（使用 `.env.local`） |
| 正式環境 | `npm run build`（使用 `.env.production`） |
