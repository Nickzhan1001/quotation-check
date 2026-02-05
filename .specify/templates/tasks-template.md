---

description: "功能實作的任務清單模板"
---

# 任務： [FEATURE NAME]

**輸入**：來自 `/specs/[###-feature-name]/` 的設計文件
**前置條件**：plan.md（必須）、spec.md（用於使用者故事）、research.md、data-model.md、contracts/

**測試**：下方示例包含測試任務。測試為「選用」— 僅在功能規格明確要求時才納入。

**組織方式**：任務依使用者故事分組，以便每個故事可以獨立實作與獨立驗證。

## 格式：`[ID] [P?] [Story] 描述`

- **[P]**：可並行（不同檔案、無相依）
- **[Story]**：此任務屬於哪個使用者故事（例如 US1、US2、US3）
- 描述中請包含「精確檔案路徑」

## 路徑慣例

- **單一專案**：repository root 下的 `src/`、`tests/`
- **Web App**：`backend/src/`、`frontend/src/`
- **行動端**：`api/src/`、`ios/src/` 或 `android/src/`
- 下方路徑示例以單一專案為主；請依 plan.md 的結構調整

<!--
  ============================================================================
  重要：下方任務為「示例」僅供說明。

  /speckit.tasks 必須依據以下內容產出「真實任務」並取代示例：
  - spec.md 的使用者故事與優先級（P1、P2、P3...）
  - plan.md 的需求與結構
  - data-model.md 的實體
  - contracts/ 的端點與契約

  任務必須依使用者故事整理，讓每個故事都能：
  - 獨立實作
  - 獨立測試
  - 作為 MVP 增量交付

  請勿保留本示例內容在產出的 tasks.md。
  ============================================================================
-->

## Phase 1：初始化（共用基礎）

**目的**：專案初始化與基本結構

- [ ] T001 依實作計畫建立專案結構
- [ ] T002 初始化 [language] 專案並加入 [framework] 依賴
- [ ] T003 [P] 設定 lint 與格式化工具

---

## Phase 2：基礎建設（阻擋性前置）

**目的**：所有使用者故事開發前必須完成的核心基礎

**⚠️ 重大**：此階段未完成前，不得開始任何使用者故事的實作

常見基礎任務示例（請依專案調整）：

- [ ] T004 建立資料庫 schema 與 migration 框架
- [ ] T005 [P] 實作驗證/授權框架
- [ ] T006 [P] 建立 API routing 與 middleware 結構
- [ ] T007 建立各故事共用的基礎 model/entity
- [ ] T008 設定錯誤處理與日誌基礎
- [ ] T009 設定環境設定管理

**Checkpoint**：基礎完成 — 後續使用者故事可開始並行

---

## Phase 3：使用者故事 1 - [Title]（優先級：P1）🎯 MVP

**目標**： [此故事交付什麼]

**獨立測試**： [如何獨立驗證此故事]

### 使用者故事 1 的測試（選用；僅在規格要求時）⚠️

> **注意：請先寫測試並確保失敗，再開始實作**

- [ ] T010 [P] [US1] 契約測試：[endpoint] → `tests/contract/test_[name].py`
- [ ] T011 [P] [US1] 整合測試：[user journey] → `tests/integration/test_[name].py`

### 使用者故事 1 的實作

- [ ] T012 [P] [US1] 建立 [Entity1] model → `src/models/[entity1].py`
- [ ] T013 [P] [US1] 建立 [Entity2] model → `src/models/[entity2].py`
- [ ] T014 [US1] 實作 [Service] → `src/services/[service].py`（依賴 T012、T013）
- [ ] T015 [US1] 實作 [endpoint/feature] → `src/[location]/[file].py`
- [ ] T016 [US1] 加上驗證與錯誤處理
- [ ] T017 [US1] 加上操作日誌

**Checkpoint**：此時使用者故事 1 應可獨立運作與獨立驗證

---

## Phase 4：使用者故事 2 - [Title]（優先級：P2）

**目標**： [此故事交付什麼]

**獨立測試**： [如何獨立驗證此故事]

### 使用者故事 2 的測試（選用；僅在規格要求時）⚠️

- [ ] T018 [P] [US2] 契約測試：[endpoint] → `tests/contract/test_[name].py`
- [ ] T019 [P] [US2] 整合測試：[user journey] → `tests/integration/test_[name].py`

### 使用者故事 2 的實作

- [ ] T020 [P] [US2] 建立 [Entity] model → `src/models/[entity].py`
- [ ] T021 [US2] 實作 [Service] → `src/services/[service].py`
- [ ] T022 [US2] 實作 [endpoint/feature] → `src/[location]/[file].py`
- [ ] T023 [US2] 與使用者故事 1 組件整合（如需要）

**Checkpoint**：使用者故事 1 與 2 皆應可獨立運作

---

## Phase 5：使用者故事 3 - [Title]（優先級：P3）

**目標**： [此故事交付什麼]

**獨立測試**： [如何獨立驗證此故事]

### 使用者故事 3 的測試（選用；僅在規格要求時）⚠️

- [ ] T024 [P] [US3] 契約測試：[endpoint] → `tests/contract/test_[name].py`
- [ ] T025 [P] [US3] 整合測試：[user journey] → `tests/integration/test_[name].py`

### 使用者故事 3 的實作

- [ ] T026 [P] [US3] 建立 [Entity] model → `src/models/[entity].py`
- [ ] T027 [US3] 實作 [Service] → `src/services/[service].py`
- [ ] T028 [US3] 實作 [endpoint/feature] → `src/[location]/[file].py`

**Checkpoint**：所有使用者故事應皆可獨立運作

---

[依需要新增更多使用者故事 Phase]

---

## Phase N：收尾與橫切關注（Polish & Cross-Cutting）

**目的**：影響多個使用者故事的改善項

- [ ] TXXX [P] 更新文件（docs/ 或 specs/）
- [ ] TXXX 程式碼整理與重構
- [ ] TXXX 全面效能優化
- [ ] TXXX [P] 額外單元測試（若有要求）→ `tests/unit/`
- [ ] TXXX 安全性強化
- [ ] TXXX 驗證 quickstart.md

---

## 相依與執行順序

### Phase 相依

- **初始化（Phase 1）**：無相依，可立即開始
- **基礎建設（Phase 2）**：依賴 Phase 1 完成，且會阻擋所有使用者故事
- **使用者故事（Phase 3+）**：皆依賴 Phase 2 完成
  - 若人力足夠可並行
  - 否則依優先級順序（P1 → P2 → P3）
- **收尾（最後 Phase）**：依賴所有要交付的使用者故事完成

### 使用者故事相依

- **使用者故事 1（P1）**：Phase 2 後即可開始，通常不依賴其他故事
- **使用者故事 2（P2）**：Phase 2 後即可開始，可能需與 US1 整合但仍需可獨立驗證
- **使用者故事 3（P3）**：Phase 2 後即可開始，可能需與 US1/US2 整合但仍需可獨立驗證

### 每個使用者故事內部順序

- 若包含測試：測試 MUST 先寫且先失敗
- Models 先於 Services
- Services 先於 Endpoints
- 先完成核心功能，再做整合
- 故事完成後再進到下一個優先級

### 可並行的地方

- Phase 1 標註 [P] 的任務可並行
- Phase 2 標註 [P] 的任務可並行（同一 Phase 內）
- Phase 2 完成後，各使用者故事可並行（視人力）
- 同一故事內標註 [P] 的測試可並行
- 同一故事內標註 [P] 的 models 可並行
- 不同使用者故事可由不同開發者並行

---

## 並行示例：使用者故事 1

```text
（若規格要求測試）可同時開跑：
Task: "契約測試：[endpoint] → tests/contract/test_[name].py"
Task: "整合測試：[user journey] → tests/integration/test_[name].py"

可同時開跑 models：
Task: "建立 [Entity1] model → src/models/[entity1].py"
Task: "建立 [Entity2] model → src/models/[entity2].py"
```

---

## 實作策略

### 先做 MVP（只做使用者故事 1）

1. 完成 Phase 1：初始化
2. 完成 Phase 2：基礎建設（重大，會阻擋所有故事）
3. 完成 Phase 3：使用者故事 1
4. **停止並驗證**：獨立測試使用者故事 1
5. 準備好就部署/展示

### 增量交付

1. 完成 初始化 + 基礎建設 → 基礎完成
2. 加入 使用者故事 1 → 獨立測試 → 部署/展示（MVP）
3. 加入 使用者故事 2 → 獨立測試 → 部署/展示
4. 加入 使用者故事 3 → 獨立測試 → 部署/展示
5. 每個故事都應能增加價值且不破壞既有故事

### 多人並行策略

若有多位開發者：

1. 全隊先完成 初始化 + 基礎建設
2. Phase 2 完成後：
   - 開發者 A：使用者故事 1
   - 開發者 B：使用者故事 2
   - 開發者 C：使用者故事 3
3. 各故事可獨立完成並整合

---

## 備註

- [P] 任務 = 不同檔案、無相依
- [Story] 用於追蹤任務對應的使用者故事
- 每個使用者故事都應可獨立完成與獨立驗證
-（若有測試）請先確認測試失敗再實作
- 建議每個任務或合理群組完成後提交
- 在任何 Checkpoint 可停下來獨立驗證
- 避免：模糊任務、同檔衝突、跨故事相依導致無法獨立
