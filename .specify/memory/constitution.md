# [PROJECT_NAME] 憲章
<!-- 例：Spec 憲章、TaskFlow 憲章等 -->

## 核心原則

### [PRINCIPLE_1_NAME]
<!-- 例：I. 先建庫（Library-First） -->
[PRINCIPLE_1_DESCRIPTION]
<!-- 例：每個功能先以可獨立測試的函式庫形式存在；函式庫必須自足、可測、可文件化；避免只有「組織用途」的空殼模組 -->

### [PRINCIPLE_2_NAME]
<!-- 例：II. CLI 介面 -->
[PRINCIPLE_2_DESCRIPTION]
<!-- 例：每個函式庫應提供 CLI 入口；文字輸入/輸出協定：stdin/args → stdout，錯誤 → stderr；同時支援 JSON 與人類可讀格式 -->

### [PRINCIPLE_3_NAME]
<!-- 例：III. 先測試（不可協商） -->
[PRINCIPLE_3_DESCRIPTION]
<!-- 例：TDD 為強制：先寫測試 → 使用者確認 → 測試失敗 → 才能實作；嚴格遵守 Red-Green-Refactor -->

### [PRINCIPLE_4_NAME]
<!-- 例：IV. 整合測試 -->
[PRINCIPLE_4_DESCRIPTION]
<!-- 例：需要整合測試的重點：新契約的契約測試、契約變更、服務間通訊、共用 schema -->

### [PRINCIPLE_5_NAME]
<!-- 例：V. 可觀測性、VI. 版本與破壞性變更、VII. 簡化優先 -->
[PRINCIPLE_5_DESCRIPTION]
<!-- 例：文字 I/O 讓除錯更容易；需結構化日誌；或：採用 MAJOR.MINOR.BUILD；或：先做最簡單可行方案，遵守 YAGNI -->

## [SECTION_2_NAME]
<!-- 例：額外限制、安全要求、效能標準等 -->

[SECTION_2_CONTENT]
<!-- 例：技術棧要求、合規標準、部署政策等 -->

## [SECTION_3_NAME]
<!-- 例：開發流程、審查流程、品質門檻等 -->

[SECTION_3_CONTENT]
<!-- 例：Code review 要求、測試門檻、上線核准流程等 -->

## 治理
<!-- 例：憲章高於其他慣例；修訂必須有文件、核准、遷移計畫 -->

[GOVERNANCE_RULES]
<!-- 例：所有 PR/Review 必須確認符合憲章；複雜度需有理由；執行時以 [GUIDANCE_FILE] 作為行為準則 -->

**版本**： [CONSTITUTION_VERSION] | **生效日**： [RATIFICATION_DATE] | **最後修訂**： [LAST_AMENDED_DATE]
<!-- 例：版本：2.1.1 | 生效日：2025-06-13 | 最後修訂：2025-07-16 -->
