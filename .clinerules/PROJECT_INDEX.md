# HOP-CFP 專案索引

> 最後更新：2026-04-02  
> **維護規則**：每次變更時同步更新本文件。

大重點!:
做完功能後請用puppeteer去驗證你的功能
如果打API被登出請用 Account: Tim/Password: !Qaz2wsx做登入

---

## 一、專案總覽

| 項目 | 技術 |
|------|------|
| **Monorepo** | Turborepo + npm workspaces |
| **語言** | TypeScript 5 |
| **框架** | Next.js 16（App Router，靜態導出）|
| **UI** | Bootstrap 5（CSS only）|
| **圖示** | Font Awesome（靜態引入）|
| **樣式** | SCSS |

---

## 二、目錄結構

```
HOP-CFP/
├── apps/
│   └── CFP/                    # 醫院端前台（Next.js 16）
├── packages/                   # 共用套件
│   ├── components/             # UI 元件庫
│   ├── contexts/               # React Context
│   ├── hooks/                  # 共用 Hooks
│   ├── lib/                    # 工具函式庫
│   ├── styles/                 # 全域樣式
│   └── types/                  # 型別定義
├── package.json                # Turbo workspaces
├── tsconfig.json               # 根 tsconfig
└── eslint.config.mjs           # ESLint 設定
```

---

## 三、根目錄設定

### `package.json`

```json
{
  "name": "frontend-ui-root",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": { "dev": "turbo dev", "build": "turbo build", "lint": "turbo lint" },
  "devDependencies": { "turbo": "latest", "typescript": "^5", "eslint": "^9", "sass": "^1.94" }
}
```

### `tsconfig.json`（根）

- `target: ES2017`，`module: esnext`，`moduleResolution: bundler`
- `strict: true`（嚴格模式）
- 路徑別名：`@packages/*` → `packages/*`

---

## 四、apps/CFP — 醫院端前台應用

### 4.1 子專案設定

**`apps/CFP/package.json`**

| 依賴 | 版本 |
|------|------|
| `next` | ^16.1.1 |
| `react` / `react-dom` | 19.2.0 |
| `qrcode` | ^1.5.4 |

啟動：`npm run dev`（Port 3001）

**`apps/CFP/next.config.ts`**

| 選項 | 設定 |
|------|------|
| `output` | `"export"` 靜態導出 |
| `distDir` | `../../out/cfp` |
| `basePath`（正式）| `/hospital/app` |
| `trailingSlash` | `true` |
| `images.unoptimized` | `true` |

**路徑別名**：`@/*` → `./src/*`、`@packages/*` → `../../packages/*`

---

### 4.2 路由結構

```
src/app/
├── layout.tsx                  # 根 Layout（全域 Provider）
├── (auth)/                     # 未驗證群組
│   ├── layout.tsx
│   ├── forgot-password/
│   ├── login/
│   └── register/
└── (main)/                     # 主應用群組（需登入）
    ├── layout.tsx              # 帶 NavBar
    ├── page.tsx                # 首頁
    ├── AdminFunction/
    ├── BuyerCompare/
    ├── Manager/
    ├── Material/
    ├── MaterialGroup/
    ├── SellerCompare/
    └── Supplier/
```

---

### 4.3 根 Layout Provider 堆疊

```
html[lang=zh-Hant]
└── HeadProvider
    └── body
        └── ToastProvider
            └── ApiProvider
                └── {children}
```

靜態資源：`bootstrap.min.css` · `all.min.css` · `globals.scss`

---

### 4.4 設定檔

#### `src/config/apis.ts` — API 路徑集中管理

#### `src/config/menus.ts` — 選單設定

`MenuItem` 型別，支援多層巢狀（`children?: MenuItem[]`）。

| key | label | 備註 |
|-----|-------|------|
| `CRITM` | 主檔維護 | |
| `CRITM_MAP` | 規格對照 | |
| `CRITM_MAP_ERR` | 對照後異常資訊 | |
| `SC_PRO` | 出貨作業 | |
| `TRN_LOG` | 庫存異動 | |
| `TRN_LOG_DUI` | 寄售耗用資料 | |
| `QSDN` | 持證到期通知 | |
| `PRINT_OPS` | 列印作業 | |
| `HMPY_CONTACT` | 醫院聯絡項目 | |
| `NTPF` | 推播訊息管理 | |
| `IAS` | 庫存輔助管理 | `isNextJsApp: true` |

---

### 4.5 API 環境變數

| 變數名稱 | 必填 | 預設值 |
|----------|------|--------|
| `NEXT_PUBLIC_API_URL` | ✅ | 無 |
| `NEXT_PUBLIC_API_PATH` | 否 | `"api"` |
| `NEXT_PUBLIC_VND_API_PATH` | 否 | `"api-vendor"` |

**API_MAP 鍵**：`HMPY` · `IS_LOGIN` · `LOGOUT` · `USER_INFO` · `REFRESH_TOKEN` · `SI_MST` · `EQP_MST` · `EQP_HSP_MST` · `EQP_SN_MST` · `MSG_MST` · `PKG_MST` · `PKG_DTL_MST` · `PKG_MSG_MST` · `PKG_TAG_MST` · `PKG_HSP_MST` · `APY_ORD_MST` · `APY_ORD_SN` · `APY_ORD_READ_LINK` · `APY_ORD_TAG` · `FDA_TRACE` · `FDA_TRACE_DOWNLOAD`

---

### 4.6 全域樣式（`src/styles/globals.scss`）

**SCSS 變數**：`$darkBlue: #2b333e` · `$ahopOrigin: #ff7f50`

**CSS Class**：

| Class | 用途 |
|-------|------|
| `.fs-7` | 縮小字體（0.875rem）|
| `.w-250` | 固定寬度 250px |
| `.td-fit` / `.td-btn-fit` | td 佈局 |
| `.qrcode-sm` / `.qrcode-lg` | QR Code 尺寸 |
| `.wrap` / `.wrap-main` / `.wrap-aside` / `.wrap-content` | 主佈局 |
| `.action-bar` | 操作列 |

---

## 五、apps/CFP 型別定義（`src/types/`）

| 檔案 | 主要型別 | 說明 |
|------|----------|------|
| `user.d.ts` | `User`, `Company` | 使用者、公司資料 |
| `crSI.d.ts` | `CrSI` | 器械主檔 |
| `crPkg.d.ts` | `CrPkgDtl`, `CrPkgMap`, `CrPkgMsgMap` | 盤包明細 |
| `crEQP.d.ts` | `CrEQPSN`, `CrEQPMap` | 設備序號 |
| `crMsg.d.ts` | `CrMsg` | 訊息管理 |
| `crPkgTag.d.ts` | `CrPkgTag` | 盤包標牌 |
| `crHmpy.d.ts` | `CrHmpy` | 醫院資料 |
| `apyOrd.d.ts` | `ApyOrdHistory`, `ApyOrdDtlSn` | 申領單 |
| `fdaTrace.d.ts` | `FdaTrace` | FDA 流向追蹤 |
| `searchForm.d.ts` | `SearchStatusForm`, `SearchKeywordForm`, `SearchDateRangeForm` | 搜尋表單 |
| `product.d.ts` | `Product`, `ProductDetail` | 產品授權 |

---

## 六、packages/ 共用套件

### 6.1 `packages/contexts/`

| 檔案 | 說明 |
|------|------|
| `ApiContext.tsx` | API 事件與認證流程 |
| `HeadContext.tsx` | `<head>` title / description 管理 |
| `ToastContext.tsx` | Toast 通知佇列（9 位置、6 顏色）|
| `SidebarContext.tsx` | 側邊欄狀態管理 |

**ApiContext 方法**：`success` · `danger` · `warning` · `info` · `primary` · `secondary`  
**SidebarContext 方法**：`registerId` · `unregisterId` · `open` · `close` · `toggle`

---

### 6.2 `packages/hooks/`

| 檔案 | 說明 |
|------|------|
| `useApi.tsx` | API Hook（`loading`/`error`/`get`/`post`/`put`/`delete`）|
| `useClickOutside.tsx` | 點擊外部監聽，返回 `domRef` |
| `useConfirm.tsx` | `window.confirm` → `Promise<boolean>` |

---

### 6.3 `packages/lib/`

| 檔案 | 說明 |
|------|------|
| `api.ts` | `apiRequest`：query string、FormData/JSON、Blob 下載、401 Token 更新 |
| `dateTimeHelper.ts` | 日期解析（`YYYYMMDD`）、台灣時區 |
| `localstorage.ts` | localStorage CRUD |
| `downloadFlie.ts` | Blob 檔案下載 |
| `cookie.ts` | Cookie 工具 |

---

### 6.4 `packages/types/`

| 檔案 | 主要型別 |
|------|----------|
| `api.d.ts` | `ApiMethod`, `ApiRequest<T>`, `ApiResponse<T>` 等 |
| `useApi.d.ts` | `loadingType`, `Handlers<T>`, `UseApiResult` |
| `bootstrap5.ts` | 表格元件 Props 型別 |
| `toast.d.ts` | Toast 位置、顏色、型別定義 |
| `crHmpy.d.ts` | 醫院資料 |
| `searchForm.d.ts` | 共用搜尋表單 |

---

### 6.5 `packages/components/`

#### Bootstrap 5 元件（`bootstrap5/`）

| 元件 | 特色 |
|------|------|
| `Btn.tsx` | icon、color、outline、size |
| `Table.tsx` | 複合元件（`Table`+`THead`+`TBody`+`Tr`+`Th`+`Td`）|
| `Input.tsx` | `Input` · `FileBtn` · `Checkbox` · `DropdownInput` |
| `Select.tsx` | `Select` · `StatusSelect` |
| `Modal.tsx` | forwardRef，複合元件（`.Title` · `.Body` · `.Wrap`）|
| `Card.tsx` | 複合元件（`.Header` · `.Body` · `.Title` · `.Text` · `.Footer` · `.Image`）|
| `Form.tsx` | 受控表單，`resetForm`/`getFormData`/`setFormData` |
| `Grid.tsx` | `Grid.Row` + `Grid.Col`（sm/md/lg/xl/xxl）|
| `Pagination.tsx` | 智慧省略號分頁 |
| `Toasts.tsx` | 9 個位置 |
| `Badges.tsx` | Badge（pill 樣式）|
| `Spinner.tsx` | `SpinnerBorder` · `SpinnerGrow` |
| `Container.tsx` | 容器（`fluid` 支援）|
| `ListGroup.tsx` | `ListGroup` · `ListGroupItem` |
| `NavBar.tsx` | `NavBar` · `NavBarNav` · `NavLink` · `NavDropdown` |

#### 通用元件（`common/`）

| 元件 | 說明 |
|------|------|
| `KeywordSearchForm.tsx` | 狀態 + 關鍵字搜尋 |
| `KeywordDateSearchForm.tsx` | 狀態 + 日期 + 關鍵字搜尋 |

#### 佈局元件（`layouts/`）

| 元件 | 說明 |
|------|------|
| `Wrap.tsx` | `<div class="wrap">` 外殼 |
| `WrapMain.tsx` | `<div class="wrap-main">` 橫排 |
| `WrapContent.tsx` | `<div class="wrap-content">` 內容區 |
| `SidebarLayout.tsx` | 側邊欄佈局（`open` class 切換）|

#### 功能型元件

| 元件 | 說明 |
|------|------|
| `ApiError.tsx` | API 錯誤 Toast（400~504），401 觸發登出 |
| `DataGrid.tsx` | 泛型 DataGrid（`columns` 配置）|
| `CustomDataGrid.tsx` | 自訂 body 渲染 |
| `StringHelper.tsx` | `FormatString` · `StatusIcon` · `OrderStatus` |
| `FontAwsome.tsx` | `<i>` 圖示包裝 |
| `ToolBar.tsx` | `Breadcrumb` 麵包屑導航 |

---

## 七、架構設計

### API 請求流程

```
useApi → apiRequest → 發出 ApiEvent → ApiContext → ApiError Toast
```

### 元件設計模式

- **複合元件**：`Modal` · `Card` · `Grid` · `Table` → `.SubComponent` 語法
- **泛型元件**：`DataGrid<T>` · `CustomDataGrid<T>`
- **forwardRef**：`Modal` · `Form` 支援父元件操作
- **Context + Hook**：全域狀態管理

---

## 八、開發指令

```bash
# 根目錄（Turborepo）
npm run dev    # 所有應用開發模式
npm run build  # 建置所有應用
npm run lint   # ESLint 檢查

# 單獨執行 CFP
cd apps/CFP && npm run dev    # http://localhost:3001
cd apps/CFP && npm run build  # 靜態導出至 out/cfp/
```

---

## 九、靜態資源（`apps/CFP/public/`）

| 路徑 | 說明 |
|------|------|
| `css/bootstrap.min.css` | Bootstrap 5 |
| `css/all.min.css` | Font Awesome（全圖示）|
| `webfonts/` | Font Awesome 字型 |
| `images/` | 圖片資源 |
| `certificates/` | HTTPS 自簽憑證 |
