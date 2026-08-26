## 最小入口
定義 HDP-CFP（HOP-CFP）專案的 AI Agent 執行規則，含程式碼變更驗證流程與前後端啟動工作流程。開始分析專案邏輯前，如果有需要則先讀 [PROJECTINDEX.md](PROJECTINDEX.md) 以快速定位前後端責任點、路由、API 契約與資料模型；需要細節時再回到實際原始碼確認。

## 專案參數
| 項目 | 值 |
|------|-----|
| 前端應用 | `apps/CFP`（Next.js 16） |
| 前端啟動 | `npm run dev -w cfp` |
| 前端網址 | http://localhost:3001 |
| 後端路徑 | `C:\Users\s7514\source\repos\HOP-CFP-Backend\HOP-CFP-Backend` |
| 後端啟動 | `dotnet run --project HOP-CFP-Backend.csproj --launch-profile https` |
| 後端網址 | https://localhost:7007 |
| 測試帳號 | Tim / !Qaz2wsx |

## 前端 CFP 修改範圍(後端不受此限制)

- CFP 相關的功能、畫面、樣式、流程與設定，只可修改本專案 `apps/CFP` 目錄內的檔案。
- 不得為 CFP 需求修改外層通用模組、`packages/*`、其他 App、Repository 根目錄設定或其他專案的檔案。
- 優先使用現有共用模組；若現有能力不足，應回報限制與影響，不得直接修改外層通用模組。

## 每次執行請注意!

- 寫程式時整個頁面盤整一下，生命週期寫好  不要寫流水帳
- 做完請用網站驗證，並檢查是否有不合理的部分
- 確保程式碼品質與正確性是最高原則，不要省token
- 每次執行任何實際動作前，都先重新評估目前狀態、目標、風險與下一步是否合理。不得因已有計畫就機械式連續執行。每次讀檔、搜尋、修改程式碼、執行指令或測試取得新資訊後，都必須根據新結果重新判斷下一步。若結果與原假設不符，停止原路徑並重新分析，不得硬照原計畫繼續。修改前確認根因與影響範圍；修改後立即驗證結果，再決定下一步。
 - 當使用者說 "啟動" 則執行 .agents\skills\start_cfp\SKILL.md
 - 所有的文字都需要用多語言的系統來開發，避免硬編碼文字。

## EF Migration 命名規則

- EF Core Migration 的時間前綴由工具以 UTC 自動產生；不可手動改成台灣時間或任意改寫 MigrationId。
- 目前 CFPDev 的 Migration 基準為 `20260806074647_Init`，後續新增 Migration 應使用 `Add-Migration <名稱>`，保留 EF Core 自動產生的 UTC 時間前綴。
- 每次程式碼有改動都要確保影響到的範圍都可以正常運作