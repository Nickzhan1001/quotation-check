# 代理規則

## 回應語言
- **一律使用繁體中文**回覆使用者：說明、註解、錯誤訊息、文件與對話內容皆以繁體中文撰寫。
- **不得切換為其他語言**，除非使用者明確要求。
- 程式碼內的識別符（變數名、函式名、檔案名等）與技術術語可維持英文；註解與給使用者的說明請用繁體中文。

---

## 建置 / 測試指令

```bash
# 擷取 DOCX 成 JSON（預設路徑）
npm run extract-docx

# 指定輸入/輸出路徑擷取
node scripts/extract-docx-to-json.mjs <input.docx> -o <output.json>

# 安裝相依套件
npm install
```

**Windows PowerShell 注意事項**：避免在參數中直接使用中文路徑（例如 `-o quote-analysis/input/報價單.json`）。請改用預設路徑或英文路徑。

---

## 程式碼風格準則

### 一般原則
- 使用 ESM 模組（`package.json` 中 `type: "module"`）
- 工具類使用具名匯出，主要入口使用 default export
- 優先使用 async/await，避免回呼

### 匯入規範
```javascript
// 依來源分組：內建 → 第三方 → 相對路徑
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
```

### 命名慣例
- **變數/函式**：camelCase（`extractDocxToJson`, `ensureArray`）
- **常數**：UPPER_SNAKE_CASE（用於設定值）
- **檔案**：script 使用 kebab-case；工具/類別使用 PascalCase
- **OOXML 節點**：使用原始鍵名（例如 `w:p`, `w:tbl`，需加引號）

### 函式
- 以 JSDoc 描述頂層函式用途與參數
- 函式保持單一職責
- 優先使用 early return 降低巢狀
- 使用 helper 進行輸入驗證（`ensureArray`, `ensureObject`）

### 錯誤處理
- 使用 `try/catch`，錯誤訊息需具體
- 無效狀態要主動丟出錯誤
- CLI 失敗時用 `process.exit(1)` 並 `console.error`
- 禁止空 catch 區塊

### 型別處理
- 空值判斷使用 `==`/`!=`（同時涵蓋 null/undefined）
- 不確定型別前先用 `typeof` 檢查
- 迭代前驗證類陣列物件（數字鍵）
- JSON 輸出前一律字串化

### 字串/文字處理
- 使用清楚的正則表達式（如日期：`/\d{4}[./-]\d{1,2}[./-]\d{1,2}/`）
- 透過鏈式轉換提高可讀性
- 處理邊界情況（null/undefined/非字串）

### OOXML 解析
- 忽略樣式節點：`w:rPr`, `w:pPr`, `w:tblPr`, `w:tcPr`, `w:trPr`, `w:sectPr`
- 忽略複雜節點：`w:drawing`, `w:pict`, `w:object`, `w:fldChar`, `w:instrText`
- 需處理 XML parser 產生的 array 與 object 兩種形式
- 清除 OOXML 雜訊：字型名、樣式十六進位碼

### Console 輸出
- 錯誤用 `console.error`，成功/資訊用 `console.log`
- 需包含關鍵上下文（路徑、數量、錯誤訊息）
- 格式保持一致

---

<skills_system priority="1">

## 可用技能

<!-- SKILLS_TABLE_START -->
<usage>
當使用者要求你執行任務時，請先檢查下方技能是否能更有效率地完成。技能提供特定領域知識與流程。

技能使用方式：
- 呼叫：`npx openskills read <skill-name>`（在 shell 中執行）
  - 多個技能：`npx openskills read skill-one,skill-two`
- 內容會載入詳細指引
- 輸出會提供基礎目錄以解析資源（references/, scripts/, assets/）

使用注意事項：
- 只能使用 <available_skills> 中列出的技能
- 已在上下文載入的技能不可重複呼叫
- 每次技能呼叫皆為無狀態
</usage>

<available_skills>

<skill>
<name>algorithmic-art</name>
<description>使用 p5.js 與可重現亂數創作演算法藝術，支援互動式參數探索。當使用者要求以程式產生藝術、生成藝術、流場或粒子系統時使用。請創作原創作品，避免仿作以免版權問題。</description>
<location>project</location>
</skill>

<skill>
<name>brand-guidelines</name>
<description>套用 Anthropic 官方品牌色與字體風格。當需要品牌色、版面視覺一致性或公司設計規範時使用。</description>
<location>project</location>
</skill>

<skill>
<name>canvas-design</name>
<description>用設計哲學建立 .png 與 .pdf 視覺作品。當使用者要求海報、藝術作品或靜態設計時使用。必須創作原創設計，避免仿作。</description>
<location>project</location>
</skill>

<skill>
<name>doc-coauthoring</name>
<description>文件共著工作流：引導撰寫文件、提案、技術規格、決策文件等。當使用者提及撰寫文件或規格時使用。</description>
<location>project</location>
</skill>

<skill>
<name>docx</name>
<description>處理 Word 文件（.docx）的建立、讀取、編輯與操作。凡涉及 Word 文件、報告、備忘錄、信件或需處理 .docx 都應使用。本技能不適用 PDF、試算表、Google Docs 或與文件無關的程式任務。</description>
<location>project</location>
</skill>

<skill>
<name>frontend-design</name>
<description>建立高品質前端介面。當使用者要求網站、元件、儀表板、版面或 UI 美化時使用。</description>
<location>project</location>
</skill>

<skill>
<name>internal-comms</name>
<description>公司內部溝通文件範本與格式。當使用者要撰寫狀態報告、領導更新、第三方更新、公司週報、FAQ、事件報告等時使用。</description>
<location>project</location>
</skill>

<skill>
<name>mcp-builder</name>
<description>建立 MCP（Model Context Protocol）伺服器的指南。當需要整合外部 API 或服務到 MCP（Python/Node/TypeScript）時使用。</description>
<location>project</location>
</skill>

<skill>
<name>pdf</name>
<description>處理 PDF 的閱讀、擷取、合併、分割、旋轉、水印、建立、表單填寫與 OCR。只要涉及 .pdf 就使用。</description>
<location>project</location>
</skill>

<skill>
<name>pptx</name>
<description>處理簡報（.pptx）的建立、讀取、編輯、布局、註解等。只要涉及簡報或 .pptx 檔案就使用。</description>
<location>project</location>
</skill>

<skill>
<name>skill-creator</name>
<description>建立或更新技能的指南。當使用者要新增/調整技能時使用。</description>
<location>project</location>
</skill>

<skill>
<name>slack-gif-creator</name>
<description>建立符合 Slack 的動態 GIF。當使用者要求製作 Slack 用 GIF 時使用。</description>
<location>project</location>
</skill>

<skill>
<name>template</name>
<description>以指定模板產出內容的技能（請依實際描述更新）。</description>
<location>project</location>
</skill>

<skill>
<name>theme-factory</name>
<description>替文件、報告、HTML landing page 等套用主題樣式。提供 10 種預設主題並可自訂。</description>
<location>project</location>
</skill>

<skill>
<name>web-artifacts-builder</name>
<description>建立多元件、含狀態管理的前端 artifacts（React/Tailwind/shadcn/ui）。複雜前端需求使用。</description>
<location>project</location>
</skill>

<skill>
<name>webapp-testing</name>
<description>用 Playwright 測試本機 Web App：操作、驗證、截圖、讀取 log。</description>
<location>project</location>
</skill>

<skill>
<name>xlsx</name>
<description>處理試算表（.xlsx/.xlsm/.csv/.tsv）讀寫、計算、格式、圖表等。當主要輸入/輸出為試算表時使用。</description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
