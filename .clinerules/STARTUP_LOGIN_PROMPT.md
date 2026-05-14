# HOP-CFP 任務前檢查清單

每次開始任何前後端、登入、或 API 驗證任務前，先完整勾選這份清單，再開始執行。

## 開始前必做

- [ ] 先確認後端有啟動：`dotnet run --project HOP-CFP-Backend.csproj --launch-profile https`
- [ ] 先確認前端有啟動：`npm run dev -w cfp`
- [ ] 打開登入頁：`http://localhost:3001/login/`
- [ ] 使用帳號 `Tim`、密碼 `!Qaz2wsx` 登入
- [ ] 看到首頁、側邊選單、以及登出按鈕後，才算登入流程成功

## 失敗時先檢查

- [ ] 若登入失敗，先確認後端是否已監聽 `https://localhost:7007`
- [ ] 若出現 401，先重新登入，再繼續測 API
- [ ] 若頁面沒有跳轉，先確認前端是否卡在 loading 或前一次失敗狀態

## 已驗證結果

- [x] 後端可成功起站
- [x] 前端可完成登入並進入登入後首頁
- [x] 導覽列與權限選單可正常顯示