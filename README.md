# 前端介面多專案管理
該專案採用 turbo 來處理多個前端專案的管理，該專案使用typescript進行開發
# 檔案結構與用途分類
apps/               個前端專案擺放位置，apps底下的每個資料夾表示一個獨立前端專案
|- hmpy/            供應商平台醫院端人員使用介面
|- vmpy/            供應商平台供應商使用介面
|-- packeg.json     packeg.json檔案   
|-- .env.           專案設定檔
|-- .env.local      專案設定檔(本地端)
|-- .env.production 專案設定檔(線上)
|-- tsconfig.json   typescript設定檔繼承父層
|-- public/         專案內的公開靜態資源
|-- src/            開發資料夾
|--- app/           專案內的頁面、layout..等
|--- components/    專案中的通用元件（只適合單個專案使用的）
|--- config/        專案中的設定檔（只適合單個專案使用的）
|--- contexts/      專案中上下文（只適合單個專案使用的）
|--- hooks/         專案中hook（只適合單個專案使用的）
|--- lib/           專案中工具類檔案（只適合單個專案使用的）
|--- style/         專案的sass樣式檔（只適合單個專案使用的）
|--- types/         專案的屬性定義檔（只適合單個專案使用的）
out/                編譯檔對應apps底下的專案
|- hmpy/            供應商平台醫院端人員使用介面（編譯檔）
|- vmpy/            供應商平台供應商使用介面（編譯檔）
packages            所有專案通用的套件
|- components/      通用元件
|-- bootstrap5/     bootstrap5相關元件 
|-- common/         可重複使用的通用元件（下拉選單、表單..等）
config/             公用的設定資訊資料夾（擺放的是全專案可共用的資訊）
contexts/           公用的上下文（像是API傳遞、toasts警報窗）可多專案共用的上下文
hooks/              公用的hook（像是useAPI、useToast）可多專案共用的hook
lib/                工具類檔案（可重複使用，獨立運作的檔案、程式、工具，像是操作cookie、localstorage、日期、自串．．等）
style/              可全局通用的sass樣式檔
types/              屬性定義檔，定義全局通用的type script定義
packeg.json         通用的packeg.json檔案，選告路徑、工作去，共同管理的元件套件..等等
tsconfig.json       typescript 宣告通用路徑

```bash
npm run dev -W {apps/[專案名稱]/packeg.json檔案中的name}
```
