# 實作計畫： [FEATURE]

**分支**：`[###-feature-name]` | **日期**： [DATE] | **規格**： [link]
**輸入**：來自 `/specs/[###-feature-name]/spec.md` 的功能規格

**備註**：此模板由 `/speckit.plan` 指令填入。執行流程請參考 `.specify/templates/commands/plan.md`。

## 摘要

[從功能規格擷取：主要需求 + 研究整理出的技術方向]

## 技術背景

<!--
  需要你動手：請用本專案的技術細節取代本段內容。
  這裡的結構僅作為建議，用來引導反覆修訂。
-->

**語言/版本**： [例：Node.js 20、Python 3.11，或 NEEDS CLARIFICATION]
**主要依賴**： [例：Vue 3、Vite，或 NEEDS CLARIFICATION]
**儲存**： [如適用：PostgreSQL、檔案，或 N/A]
**測試**： [例：vitest、pytest，或 NEEDS CLARIFICATION]
**目標平台**： [例：Windows、Linux、瀏覽器，或 NEEDS CLARIFICATION]
**專案型態**： [單一/網站/行動 - 影響目錄結構]
**效能目標**： [領域相關，例如：3 秒可操作、60 fps，或 NEEDS CLARIFICATION]
**限制**： [領域相關，例如：<200ms p95、離線可用，或 NEEDS CLARIFICATION]
**規模/範圍**： [領域相關，例如：10k users、50 screens，或 NEEDS CLARIFICATION]

## 憲章檢查

*門檻：Phase 0 研究前必須通過；Phase 1 設計後需再次檢查。*

[依 constitution.md 定義的門檻與檢查結果]

## 專案結構

### 文件（本功能）

```text
specs/[###-feature]/
├── plan.md              # 本檔（/speckit.plan 產出）
├── research.md          # Phase 0 產出（/speckit.plan）
├── data-model.md        # Phase 1 產出（/speckit.plan）
├── quickstart.md        # Phase 1 產出（/speckit.plan）
├── contracts/           # Phase 1 產出（/speckit.plan）
└── tasks.md             # Phase 2 產出（/speckit.tasks；不由 /speckit.plan 建立）
```

### 原始碼（repository root）

<!--
  需要你動手：用此功能的實際目錄結構取代下方示意樹。
  刪除未使用的選項，並把目錄補到「真實路徑」。
  交付的 plan.md 不得保留 Option 標籤。
-->

```text
# [若未使用請刪除] 選項 1：單一專案（預設）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [若未使用請刪除] 選項 2：Web 應用（偵測到 "frontend" + "backend" 時）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [若未使用請刪除] 選項 3：行動端 + API（偵測到 iOS/Android 時）
api/
└── [同 backend 結構]

ios/ 或 android/
└── [平台結構：功能模組、UI flow、平台測試]
```

**結構決策**： [記錄選擇的結構，並引用上方列出的真實目錄]

## 複雜度追蹤

> **只有在「憲章檢查」有違規且需要合理化時才填**

| 違規 | 必要原因 | 為何拒絕更簡方案 |
|------|----------|------------------|
| [例：第 4 個子專案] | [當前需求] | [為何 3 個不足] |
| [例：Repository pattern] | [具體問題] | [為何直接 DB access 不足] |
