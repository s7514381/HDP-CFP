# start_cfp

## 觸發條件

當使用者以單獨指令說「啟動」時，執行本技能。使用者只是描述「啟動」或詢問啟動方式時，不要因此啟動服務。

## 目標

啟動 HOP-CFP 前端與後端，確認服務就緒後，以瀏覽器開啟前端並自動登入開發測試帳號。

## 執行規則

1. 先檢查服務是否已在執行，避免重複啟動。檢查必須使用 `curl.exe`，不要只依賴 PowerShell `Invoke-WebRequest`：
   - 前端：`http://localhost:3001/login`
   - 後端：`https://localhost:7007`
   - 前端跟隨 `301`/`308` redirect 後收到 `200` 才算就緒。
   - 後端根路徑收到任何 `2xx` 至 `5xx` HTTP 狀態都代表 ASP.NET Core 已啟動；`404` 不代表服務失敗。
2. 若服務尚未就緒，在 Windows PowerShell 中以獨立程序啟動；只啟動未就緒的那一個：
   - 前端工作目錄：`C:\Users\s7514\source\repos\HOP-CFP`
   - 前端命令：`npm.cmd run dev -w cfp`
   - 後端工作目錄：`C:\Users\s7514\source\repos\HOP-CFP-Backend\HOP-CFP-Backend`
   - 後端命令：`dotnet.exe run --project HOP-CFP-Backend.csproj --launch-profile https`
3. 啟動程序時將標準輸出與錯誤輸出導向 `$env:TEMP\hop-cfp\frontend.out.log`、`$env:TEMP\hop-cfp\frontend.err.log`、`$env:TEMP\hop-cfp\backend.out.log`、`$env:TEMP\hop-cfp\backend.err.log`，以便啟動失敗時回報根因；不要把這些 log 寫入 repository。
4. 啟動後分別輪詢尚未就緒的服務，最多等待 120 秒；Next.js 第一次編譯期間必須持續等待，不要因單次連線失敗就重啟程序。每次輪詢前檢查啟動程序仍存在，並使用以下方式確認：
   - 前端：`curl.exe -sS -L -o NUL -w "%{http_code}" --max-time 5 http://localhost:3001/login`，只有 `200` 算成功。
   - 後端：`curl.exe -k -sS -o NUL -w "%{http_code}" --max-time 5 https://localhost:7007/`，只要輸出符合 `^[1-5][0-9][0-9]$` 算成功。
   - 輪詢期間若程序已結束，立即讀取對應 error log；若程序仍在執行，繼續等待，不要誤判為卡住。
   - 逾時或程序提前結束時，讀取對應錯誤 log 並明確回報，不要假設服務已成功啟動。
5. 服務就緒後，使用瀏覽器開啟 `http://localhost:3001/login`：
   - 若已位於登入後頁面，先確認首頁可用，不要重複登入。
   - 否則優先使用瀏覽器工具開啟頁面、填入 `[name="Account"]` 與 `[name="Password"]`，再按下 `form button[type="submit"]`；若工具提供 `openBrowserPage`、`typeInPage`、`clickElement` 或 Playwright 操作，應使用這些工具完成流程。
   - 不得只開啟登入頁、只確認服務 HTTP 200，或只提交表單就宣稱完成；提交後必須重新讀取瀏覽器狀態，確認目前 URL 已離開 `/login`，並確認首頁內容已載入。
   - 若第一次提交仍停留在 `/login`，應讀取頁面上的錯誤訊息或登入 API 回應並回報失敗，不得猜測登入成功。
   - 帳號與密碼只從本 repository 的 `AGENTS.md` 讀取；不要把密碼寫入 skill、命令列、log、回覆或其他檔案。
   - 不要在聊天回覆中顯示帳密或 token。
6. 登入完成條件是瀏覽器離開 `/login` 且首頁載入成功。只有在重新讀取瀏覽器狀態取得這兩項證據後，才能在回覆中標記「登入驗證成功」。若登入失敗，回報頁面錯誤或 API 回應，不能回報成功。
7. 最後回覆前端網址、後端網址、兩個程序是否已就緒，以及登入驗證結果；不要回報密碼、token 或完整 log 內容。

## PowerShell 啟動範例

啟動前先以 HTTP 檢查確認尚未就緒；以下範例中的 `Start-Process` 應在已確認需要啟動時才執行：

```powershell
$logDir = Join-Path $env:TEMP 'hop-cfp'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

# Follow the frontend redirect and treat any backend HTTP response as server-ready.
function Test-FrontendReady {
  $status = & curl.exe -sS -L -o NUL -w '%{http_code}' --max-time 5 'http://localhost:3001/login'
  $exitCode = $LASTEXITCODE
  return ($exitCode -eq 0 -and $status.Trim() -eq '200')
}
function Test-BackendReady {
  $status = & curl.exe -k -sS -o NUL -w '%{http_code}' --max-time 5 'https://localhost:7007/'
  $exitCode = $LASTEXITCODE
  return ($exitCode -eq 0 -and $status.Trim() -match '^[1-5][0-9][0-9]$')
}

$frontendProcess = $null
$backendProcess = $null
if (-not (Test-FrontendReady)) {
  $frontendProcess = Start-Process -FilePath 'npm.cmd' `
    -ArgumentList @('run', 'dev', '-w', 'cfp') `
    -WorkingDirectory 'C:\Users\s7514\source\repos\HOP-CFP' `
    -RedirectStandardOutput (Join-Path $logDir 'frontend.out.log') `
    -RedirectStandardError (Join-Path $logDir 'frontend.err.log') `
    -WindowStyle Hidden `
    -PassThru
}
if (-not (Test-BackendReady)) {
  $backendProcess = Start-Process -FilePath 'dotnet.exe' `
    -ArgumentList @('run', '--project', 'HOP-CFP-Backend.csproj', '--launch-profile', 'https') `
    -WorkingDirectory 'C:\Users\s7514\source\repos\HOP-CFP-Backend\HOP-CFP-Backend' `
    -RedirectStandardOutput (Join-Path $logDir 'backend.out.log') `
    -RedirectStandardError (Join-Path $logDir 'backend.err.log') `
    -WindowStyle Hidden `
    -PassThru
}

$deadline = (Get-Date).AddSeconds(120)
do {
  if ($frontendProcess -and $frontendProcess.HasExited) {
    throw 'Frontend process exited before becoming ready.'
  }
  if ($backendProcess -and $backendProcess.HasExited) {
    throw 'Backend process exited before becoming ready.'
  }
  $frontendReady = Test-FrontendReady
  $backendReady = Test-BackendReady
  if ($frontendReady -and $backendReady) { break }
  Start-Sleep -Seconds 2
} while ((Get-Date) -lt $deadline)
```

啟動後必須實際輪詢 URL 並確認可用，不能只依賴 `Start-Process` 成功返回。不要使用會等待命令前景結束的 `dotnet run` 或 `npm run dev` 直接阻塞目前對話；應使用上述獨立程序方式。若瀏覽器工具無法操作或本機 HTTPS 憑證阻擋登入，保留服務執行狀態並清楚回報阻塞原因。
