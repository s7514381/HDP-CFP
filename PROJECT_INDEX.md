# HOP-CFP 專案索引 (PROJECT_INDEX)

> 最後更新：2026-03-20
> **維護規則**：每次新增 / 修改 / 刪除時，
> 請同步更新本文件對應章節，以確保索引準確。
---

## 一、專案總覽

**HOP-CFP** 是一套醫療設備供應鏈管理前端平台，採用 **Turborepo Monorepo** 架構管理多個子應用與共用套件。

| 項目 | 說明 |
|------|------|
| Monorepo 工具 | [Turborepo](https://turbo.build/) |
| 語言 | TypeScript 5 |
| 框架 | Next.js 16（App Router，靜態導出 `output: "export"`）|
| UI 框架 | Bootstrap 5（手動引入 CSS，不使用 JS bundle）|
| 圖示 | Font Awesome（靜態資源引入）|
| 樣式 | SCSS（Sass）|
| 套件管理 | npm workspaces |

---

## 二、Monorepo 目錄結構

```
HOP-CFP/
├── apps/
│   └── CFP/                    ← 醫院端前台應用（Next.js 16）
├── packages/                   ← 多專案共用套件
│   ├── components/             ← UI 元件庫（Bootstrap5 封裝 + 通用元件）
│   ├── contexts/               ← 共用 React Context（Api / Head / Toast / Sidebar）
│   ├── hooks/                  ← 共用 Hooks（useApi / useClickOutside / useConfirm）
│   ├── lib/                    ← 工具函式庫（api / dateTime / localStorage / download）
│   ├── styles/                 ← 全域樣式（globals.scss）
│   └── types/                  ← TypeScript 型別定義
├── package.json                ← Turbo workspaces 設定（name: frontend-ui-root）
├── tsconfig.json               ← 根 tsconfig（子專案共同繼承）
├── eslint.config.mjs           ← 全域 ESLint 設定
└── PROJECT_INDEX.md            ← 本檔案
```

---

## 三、根目錄設定檔

### `package.json`

| 屬性 | 值 |
|------|----|
| `name` | `frontend-ui-root` |
| `workspaces` | `apps/*`, `packages/*` |
| `scripts` | `dev` / `build` / `lint`（均透過 turbo 執行）|
| 主要 devDependencies | `turbo`, `typescript ^5`, `eslint ^9`, `sass ^1.94` |

### `tsconfig.json`（根）

- `target: ES2017`，`module: esnext`，`moduleResolution: bundler`
- `strict: true`（嚴格模式）
- **全域路徑別名**：`@packages/*` → `packages/*`

### `eslint.config.mjs`（根）

- 使用 `typescript-eslint` + `@eslint/js`
- 忽略：`node_modules`, `dist`, `out`, `.next`
- 規則：`no-unused-vars: warn`、`@typescript-eslint/no-explicit-any: warn`

---

## 四、apps/CFP — 醫院端前台應用

### 4.1 子專案設定

**`apps/CFP/package.json`**（`name: cfp`）

| 依賴 | 版本 |
|------|------|
| `next` | ^16.1.1 |
| `react` / `react-dom` | 19.2.0 |
| `qrcode` | ^1.5.4 |
| 啟動指令 | `next dev --experimental-https`（自簽憑證開發）|

**`apps/CFP/next.config.ts`**

| 選項 | 設定 |
|------|------|
| `output` | `"export"` 純靜態導出 |
| `distDir` | `../../out/cfp` |
| `basePath`（production）| `/hospital/app` |
| `trailingSlash` | `true` |
| `images.unoptimized` | `true` |

**`apps/CFP/tsconfig.json`**

- 繼承：`../../tsconfig.json`
- 路徑別名：`@/*` → `./src/*`、`@packages/*` → `../../packages/*`

---

### 4.2 路由結構（App Router）

```
src/app/
├── layout.tsx                  ← 根 Layout（注入全域 Provider）
├── (auth)/                     ← 未驗證路由群組
│   ├── layout.tsx              ← 透通佈局
│   └── login/
│       └── page.tsx            ← 登入頁（⚠️ 佔位符，待實作）
└── (main)/                     ← 主應用路由群組（需登入）
    ├── layout.tsx              ← 帶 NavBar 的主佈局
    ├── page.tsx                ← 首頁
    ├── test/
    │   └── page.tsx            ← 功能測試頁
    ├── testCRUD/
    │   └── page.tsx            ← 本地端 CRUD 完整範例
    └── Supplier/
        ├── page.tsx            ← 供應商管理列表
        └── Create/
            └── page.tsx        ← 新增供應商表單
```

---

### 4.3 根 Layout Provider 堆疊

```
html[lang=zh-Hant]
└── HeadProvider                ← 管理 <head> title / description
    └── body
        └── ToastProvider       ← 全域 Toast 通知隊列
            └── ApiProvider     ← 全域 API 狀態 & 錯誤處理
                └── {children}
```

靜態資源引入：
- `public/css/bootstrap.min.css`
- `public/css/all.min.css`（Font Awesome）
- `src/styles/globals.scss`

---

### 4.4 設定檔

#### `src/config/apis.ts`

> ⚠️ 目前為**空檔案**，API 路徑集中管理於 `src/lib/apiRoutes.ts`。

#### `src/config/menus.ts` — 選單設定

使用 `MenuItem` 型別，支援多層巢狀（`children?: MenuItem[]`）。

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
| `IAS` | 庫存輔助管理 | `isNextJsApp: true`，子項目走 Next.js 路由 |

`IAS` 子菜單包含：`SI_MGT`、`PKG_MGT`、`EQP_MGT`、`MSG_MGT`、`APY_ORD` 等。

---

### 4.5 `src/lib/apiRoutes.ts` — API 路徑總表

從環境變數組合 API Base URL：

| 環境變數 | 預設值 |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | 無（必填）|
| `NEXT_PUBLIC_API_PATH` | `"api"` |
| `NEXT_PUBLIC_VND_API_PATH` | `"api-vendor"` |

**API_MAP 鍵清單：**

`HMPY` · `IS_LOGIN` · `LOGOUT` · `USER_INFO` · `REFRESH_TOKEN` · `SI_MST` · `EQP_MST` · `EQP_HSP_MST` · `EQP_SN_MST` · `MSG_MST` · `PKG_MST` · `PKG_DTL_MST` · `PKG_MSG_MST` · `PKG_TAG_MST` · `PKG_HSP_MST` · `APY_ORD_MST` · `APY_ORD_SN` · `APY_ORD_READ_LINK` · `APY_ORD_TAG` · `FDA_TRACE` · `FDA_TRACE_DOWNLOAD`

---

### 4.6 `src/contexts/UserContext.tsx`

- 提供 `UserProvider` + `useUser` Hook
- 儲存 `user: User | null`
- 使用 `useMemo` 避免多餘重渲染
- ⚠️ 目前尚未整合進 `RootLayout`

---

### 4.7 `src/styles/globals.scss` — 全域樣式

**自訂 SCSS 變數：**

| 變數 | 值 |
|------|----|
| `$darkBlue` | `#2b333e` |
| `$ahopOrigin` | `#ff7f50`（品牌橘色）|

**自訂 CSS Class：**

| Class | 用途 |
|-------|------|
| `.fs-7` | 縮小字體（0.875rem）|
| `.w-250` | 固定寬度 250px |
| `.td-fit` | td 自適應內容寬度 |
| `.td-btn-fit` | 多按鈕 td 佈局 |
| `.qrcode-sm` / `.qrcode-lg` | QR Code 圖片尺寸 |
| `.wrap` | 主佈局外殼（flex column，100vh）|
| `.wrap-main` | 主內容區域（flex row）|
| `.wrap-aside` | 側邊欄（可展開至 220px）|
| `.wrap-content` | 右側內容區（flex-grow，overflow hidden）|
| `.action-bar` | 操作列（含 title 樣式）|

---

## 五、apps/CFP 型別定義（`src/types/`）

| 檔案 | 主要型別 | 說明 |
|------|----------|------|
| `user.d.ts` | `User`, `Company` | 使用者帳號、公司資料 |
| `crSI.d.ts` | `CrSI` | 器械主檔（名稱、FDA許可、品牌、材質、功能）|
| `crPkg.d.ts` | `CrPkgDtl`, `CrPkgMap`, `CrPkgMsgMap` | 盤包明細、醫院/訊息對照 |
| `crEQP.d.ts` | `CrEQPSN`, `CrEQPMap` | 設備序號表、設備醫院對照 |
| `crMsg.d.ts` | `CrMsg` | 訊息管理（Type, Content）|
| `crPkgTag.d.ts` | `CrPkgTag` | 盤包標牌（Code, CrPkgId, Memo）|
| `crHmpy.d.ts` | `CrHmpy` | 醫院資料（統編、名稱、地址、聯絡）|
| `apyOrd.d.ts` | `ApyOrdHistory`, `ApyOrdDtlSn` | 申領單異動紀錄、序號對照 |
| `fdaTrace.d.ts` | `FdaTrace` | FDA 來源流向追蹤 |
| `searchForm.d.ts` | `SearchStatusForm`, `SearchKeywordForm`, `SearchDateRangeForm` | 搜尋表單型別（含繼承鏈）|
| `product.d.ts` | `Product`, `ProductDetail` | 產品授權明細 |

---

## 六、packages/ 共用套件

### 6.1 `packages/contexts/`

| 檔案 | 說明 |
|------|------|
| `ApiContext.tsx` | 集中管理 API 事件與認證流程（Token 更新、登出導向）|
| `HeadContext.tsx` | 管理 `<head>` title / description（預設「供應商平台 - aHOP」）|
| `ToastContext.tsx` | 全域 Toast 通知佇列（支援 9 位置、6 顏色、autoHide）|
| `SidebarContext.tsx` | 浮動側邊欄狀態管理（多實例動態 ID 註冊/切換）|

**`ApiContext.tsx` 狀態說明：**

| State | 說明 |
|-------|------|
| `apiEvent` | 最新 API 事件（status, loadingStatus, requestId）|
| `tokenRefreshUrl` | Token 更新端點 |
| `userLoginUrl` | 登入頁路徑 |
| `userLogoutUrl` | 登出端點 |
| `useRedirectLogout` | 是否使用 301 轉跳登出 |

**`ToastContext.tsx` 方法：**

`success(msg)` · `danger(msg)` · `warning(msg)` · `info(msg)` · `primary(msg)` · `secondary(msg)`

**`SidebarContext.tsx` 方法：**

`registerId(id)` · `unregisterId(id)` · `open(id)` · `close()` · `toggle(id)`

---

### 6.2 `packages/hooks/`

| 檔案 | 說明 |
|------|------|
| `useApi.tsx` | 核心 API Hook，包裝 `apiRequest`，提供 `loading`/`error`/`get`/`post`/`put`/`delete` |
| `useClickOutside.tsx` | 監聽點擊元素外部事件（`mousedown`/`touchstart`），返回 `domRef` |
| `useConfirm.tsx` | 封裝 `window.confirm` 為 `Promise<boolean>`，方便替換為自訂 Modal |

**`useApi` 返回值：**

```typescript
{
  loading: 'idle' | 'loading' | 'success' | 'error',
  error: string | null,
  setError: Dispatch,
  request: <TRes, TReq>(url, options) => Promise<ApiResponse<TRes>>,
  get: fn, post: fn, put: fn, delete: fn
}
```

---

### 6.3 `packages/lib/`

| 檔案 | 說明 |
|------|------|
| `api.ts` | 核心 fetch 封裝（`apiRequest`）：query string 組合、FormData/JSON、Blob 下載、401 自動更新 Token |
| `dateTimeHelper.ts` | 日期時間工具：解析 `YYYYMMDD`/`YYYYMMDD-HHMMSS`、取台灣時區當前日期時間 |
| `localstorage.ts` | localStorage CRUD：`set`/`get`/`update`/`remove`/`clear`/`has`/`getKeys` |
| `downloadFile.ts` | Blob 檔案下載（建立 `<a>` 標籤觸發下載，自動清理 ObjectURL）|
| `cookie.ts` | ⚠️ **空檔案**，Cookie 工具尚未實作 |

---

### 6.4 `packages/types/`

| 檔案 | 主要型別 | 說明 |
|------|----------|------|
| `api.d.ts` | `ApiMethod`, `ApiRequest<T>`, `ApiResponse<T>`, `ApiResponseList<T>`, `ApiEvent`, `ApiContextConfig`, `ApiContextValue` | API 層完整型別 |
| `useApi.d.ts` | `loadingType`, `Handlers<T>`, `UseApiRequest<TRes,TReq>`, `UseApiResult` | useApi Hook 型別 |
| `bootstrap5.ts` | `TableProps`, `THeadProps`, `TRProps`, `THProps`, `TDProps` | 表格元件 Props 型別 |
| `toast.d.ts` | `ToastPosition`(1-9), `ToastColor`, `ToastOptions`, `ToastContextType`, `ToastItem`, `ToastContainerProps` | Toast 相關型別 |
| `crHmpy.d.ts` | `CrHmpy` | 醫院資料（與 apps/CFP 同步）|
| `searchForm.d.ts` | `SearchStatusForm`, `SearchKeywordForm`, `SearchDateRangeForm` | 共用搜尋表單型別 |

---

### 6.5 `packages/components/`

#### Bootstrap 5 封裝元件（`bootstrap5/`）

| 元件 | 主要 Props / 特色 |
|------|------------------|
| `Btn.tsx` | icon（24 種圖示）、color、outline、size、disabled |
| `Table.tsx` | 複合元件：`Table`+`THead`+`TBody`+`TFoot`+`Tr`+`Th`+`Td`；支援 striped/bordered/hover |
| `Input.tsx` | `Input`（含 error 顯示）、`FileBtn`（隱藏 input）、`Checkbox`、`DropdownInput` |
| `Select.tsx` | `Select`（含驗證錯誤）、`StatusSelect`（啟用/停用常用選項）|
| `NavBar.tsx` | `NavBar`+`NavBarNav`+`NavLink`+`NavDropdown`（`'use client'`）|
| `Modal.tsx` | `forwardRef` Modal；複合元件：`Modal.Title`+`Modal.Body`+`Modal.Wrap` |
| `Card.tsx` | 複合元件：`Card.Header`+`Card.Body`+`Card.Title`+`Card.Text`+`Card.Footer`+`Card.Image` |
| `Form.tsx` | 受控表單 `forwardRef`；支援 `resetForm`/`getFormData`/`setFormData`、自動遞歸注入 `onChange` |
| `Grid.tsx` | `Grid.Row`+`Grid.Col`；支援所有 BS5 斷點（sm/md/lg/xl/xxl）|
| `Pagination.tsx` | 含智慧省略號分頁，`Links` 型別 |
| `Toasts.tsx` | `Toast`+`ToastHeader`+`ToastBody`；支援 9 個位置 |
| `Badges.tsx` | Badge，支援 pill 樣式 |
| `Spinner.tsx` | `SpinnerBorder`+`SpinnerGrow`；支援全覆蓋（`full: true`）|
| `Container.tsx` | 容器，支援 `fluid`、`as: 'div'|'main'` |
| `ListGroup.tsx` | `ListGroup`+`ListGroupItem`；支援 a/button/li 渲染 |

#### 通用元件（`common/`）

| 元件 | 說明 |
|------|------|
| `KeywordSearchForm.tsx` | 狀態 + 關鍵字搜尋表單 |
| `KeywordDateSearchForm.tsx` | 狀態 + 日期區間 + 關鍵字搜尋表單 |

#### 佈局元件（`layouts/`）

| 元件 | 說明 |
|------|------|
| `Wrap.tsx` | `<div class="wrap">` 外殼 |
| `WrapMain.tsx` | `<div class="wrap-main">` 主內容橫排 |
| `WrapContent.tsx` | `<div class="wrap-content">` 右側內容區 |
| `SidebarLayout.tsx` | `SidebarLayout`（`open` class 切換）+ `SidebarChild`（動態 ID 註冊）|

#### 功能型元件

| 元件 | 說明 |
|------|------|
| `FontAwsome.tsx` | `<i class="${icon}">` Font Awesome 圖示包裝 |
| `ApiError.tsx` | 全域 API 錯誤 Toast 處理（400~504），401 自動觸發登出流程 |
| `StringHelper.tsx` | `FormatString`（空值佔位）、`StatusIcon`（1=綠勾/0=紅叉）、`OrderStatus`（訂單狀態文字）|
| `DataGrid.tsx` | 泛型 DataGrid：`columns` 配置式渲染，含 loading spinner 與分頁 |
| `CustomDataGrid.tsx` | 全自訂 body 渲染的 DataGrid，傳入 `body: ({key, item}) => ReactNode` |
| `ToolBar.tsx` | ⚠️ 只有 `BreadcrumbItem`/`Breadcrumb` 型別，元件實作尚未完成 |

---

## 七、架構設計說明

### API 請求流程

```
使用者操作
  └── useApi (packages/hooks/useApi.tsx)
        └── apiRequest (packages/lib/api.ts)
              ├── 自動附加 query string
              ├── 支援 JSON / FormData body
              ├── Blob 檔案下載
              ├── 401 → tryRefreshToken → 重試 or 觸發 logout
              └── 發出 ApiEvent
                    └── ApiContext (packages/contexts/ApiContext.tsx)
                          └── ApiError 元件顯示錯誤 Toast
```

### 認證流程

```
頁面載入 → 判斷 IS_LOGIN API → 未登入 → 導向 /login
登入成功 → 取得 User 資料 → 儲存至 UserContext
Token 過期（401）→ 呼叫 REFRESH_TOKEN → 成功則重試 → 失敗則登出
```

### 元件設計模式

- **複合元件（Compound Components）**：`Modal`、`Card`、`Grid`、`Table` 均採用 `.SubComponent` 語法
- **泛型元件**：`DataGrid<T>`、`CustomDataGrid<T>` 支援型別安全欄位配置
- **forwardRef**：`Modal`、`Form` 支援父元件直接操作（`resetForm`、`getFormData`）
- **Context + Hook**：所有全域狀態均透過 Context 提供，配套 Hook 供元件消費

---

## 八、待完善項目（TODO）

| 項目 | 位置 | 狀態 |
|------|------|------|
| 登入頁實作 | `apps/CFP/src/app/(auth)/login/page.tsx` | ⚠️ 佔位符 |
| Cookie 工具實作 | `packages/lib/cookie.ts` | ⚠️ 空檔案 |
| apis.ts 填充 | `apps/CFP/src/config/apis.ts` | ⚠️ 空檔案 |
| UserContext 整合進 RootLayout | `apps/CFP/src/app/layout.tsx` | ⚠️ 未嵌套 Provider |
| ToolBar 元件實作 | `packages/components/ToolBar.tsx` | ⚠️ 只有型別定義 |
| ApiContext initialConfig 補完 | `apps/CFP/src/app/layout.tsx` | ⚠️ tokenRefreshUrl 等設定未傳入 |

---

## 九、環境變數說明

| 變數名稱 | 必填 | 說明 |
|----------|------|------|
| `NEXT_PUBLIC_API_URL` | ✅ | API Base URL |
| `NEXT_PUBLIC_API_PATH` | 否 | API 路徑前綴（預設 `"api"`）|
| `NEXT_PUBLIC_VND_API_PATH` | 否 | Vendor API 路徑前綴（預設 `"api-vendor"`）|

---

## 十、開發指令

```bash
# 根目錄執行（透過 Turborepo）
npm run dev       # 啟動所有應用開發模式
npm run build     # 建置所有應用
npm run lint      # ESLint 檢查所有套件

# 單獨啟動 CFP 應用
cd apps/CFP
npm run dev       # https://localhost:3000（自簽憑證）
npm run build     # 靜態導出至 out/cfp/
```

---

## 十一、靜態資源（`apps/CFP/public/`）

| 路徑 | 說明 |
|------|------|
| `public/css/bootstrap.min.css` | Bootstrap 5 CSS |
| `public/css/all.min.css` | Font Awesome（全圖示）|
| `public/css/all.css` | Font Awesome（未壓縮版）|
| `public/webfonts/` | Font Awesome 字型檔 |
| `public/images/` | 靜態圖片資源 |
| `certificates/` | HTTPS 自簽憑證（開發用）|
