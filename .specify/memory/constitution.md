<!--
Sync Impact Report
==================
Version change: 0.1.0 → 1.0.0 (MAJOR)
- Initial constitution establishment from AGENTS.md and project specs

Modified principles:
- N/A (new constitution)

Added sections:
- All 5 core principles (I-V)
- Development workflow section
- Governance section

Removed sections:
- N/A (template replaced entirely)

Templates requiring updates: N/A (constitution is the source)
- tasks-template.md: ✅ Compatible (already supports MVP, testability concepts)
- plan-template.md: ✅ Compatible (already references constitution)
- spec-template.md: ✅ Compatible (already has user stories, testability)

Follow-up TODOs: None
-->

# 報價單擷取 憲章

## 核心原則

### I. 高品質
所有程式碼必須遵循專案既有的程式碼風格準則（參考 `AGENTS.md`），
確保可讀性、可維護性與一致性。

### II. 可測試
函式必須具備單一職責，便於獨立測試；
每個使用者故事都必須可獨立驗證。

### III. MVP 優先
先交付最小可行產品，確認核心價值後再逐步擴充功能。
避免過早實作非必要的複雜性。

### IV. 避免 Overdesign
在滿足需求的前提下，選擇最簡單的解決方案。
除非有明確且必要的理由，否則不引入額外抽象層或複雜架構。

### V. 正體中文
使用者介面、文件、錯誤訊息和程式碼註解皆使用正體中文。
技術術語和識別符可維持英文。

## 開發流程

### 憲章高於其他慣例
憲章原則具有最高優先級，任何程式碼變更都必須符合憲章。

### 複雜度必須有理由
偏離憲章原則（如引入額外抽象層）時，必須在 `plan.md` 中記錄：
- 違規內容
- 必要原因
- 為何拒絕更簡方案

### Code Review
所有變更必須通過 Code Review，確認符合憲章原則。

### 測試門檻
每個使用者故事都必須能獨立驗證通過後才能交付。

### 增量交付
依優先級（P1 → P2 → P3）逐步實作，每個增量都必須可獨立運作。

## 治理

### 版本政策
- **MAJOR**：憲章原則的移除或重新定義（向後不相容）
- **MINOR**：新增原則或大幅擴充現有原則
- **PATCH**：措辭澄清、修正、非語意性微調

### 修訂程序
1. 提出憲章修訂提案
2. 記錄變更理由與影響評估
3. 更新版本號與日期
4. 確保相關模板與文件同步

### 合規審查
所有 PR/Review 都必須確認符合憲章；
偏離原則時必須有書面理由並獲核准。

---

**版本**：1.0.0 | **生效日**：2026-02-06 | **最後修訂**：2026-02-06
