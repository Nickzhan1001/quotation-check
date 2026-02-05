# Quotation Check（報價單擷取）

從 Word 報價單（.docx）擷取段落與表格內容，轉成結構化 JSON，供後續比對或分析使用。

## 功能

- 解析 .docx 內部的 OOXML（`word/document.xml`）
- 擷取**段落**：自動分類為標題、日期、備註、內文等
- 擷取**表格**：轉成二維陣列，並可轉為「第一列當標題」的物件陣列
- 過濾 OOXML 雜訊（字型名、樣式碼等），保留可讀文字
- 輸出單一 JSON 檔案，含來源檔名與擷取時間

## 目錄結構

```
quotation-check/
├── scripts/
│   └── extract-docx-to-json.mjs   # 擷取腳本
├── quote-analysis/
│   ├── input/                     # 放置要處理的 .docx
│   └── output/                   # 輸出的 .json
├── package.json
└── README.md
```

## 環境需求

- Node.js（建議 18+）
- npm

## 安裝

```bash
npm install
```

## 使用方式

### 使用預設路徑

不帶參數執行時，會使用預設輸入與輸出路徑：

- **預設輸入**：`quote-analysis/input/` 內**最新修改時間**的 `.docx`
- **預設輸出**：`quote-analysis/output/` 下，檔名改為 `.json`

```bash
npm run extract-docx
```

或：

```bash
node scripts/extract-docx-to-json.mjs
```

### 指定輸入與輸出

```bash
node scripts/extract-docx-to-json.mjs <輸入.docx> -o <輸出.json>
```

**注意**：在 Windows PowerShell 下，若 `-o`／`--output` 使用**含中文的路徑**可能發生編碼錯誤。建議使用預設路徑，或改為英文路徑／其他 shell（如 Git Bash）。

## 輸出格式

輸出的 JSON 大致結構如下：

```json
{
  "source": "檔名.docx",
  "extractedAt": "2025-02-05T...",
  "paragraphs": [
    { "text": "報 價 單", "type": "title" },
    { "text": "提報日期：2025/12/19", "type": "date" },
    { "text": "一般內文...", "type": "content" }
  ],
  "titles": ["功能列表", "作業列表"],
  "tables": [
    ["欄位1", "欄位2"],
    ["值1", "值2"]
  ],
  "tablesAsObjects": [{ "欄位1": "值1", "欄位2": "值2" }]
}
```

- **paragraphs**：每個段落含 `text` 與 `type`（`title` | `date` | `note` | `heading` | `content` | `empty`）
- **titles**：辨識到的章節標題（如「功能列表」「作業列表」）
- **tables**：原始二維陣列（第一列為標題）
- **tablesAsObjects**：表格轉成「第一列當 key」的物件陣列

## 授權與備註

- 本專案為私有（`private: true`），依專案規定使用即可。
- 擷取邏輯與 OOXML 注意事項可參考專案內 `.cursor/rules/docx-extract.mdc`。
