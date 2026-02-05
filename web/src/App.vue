<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const rawJson = ref('');
const doc = ref(null);
const errorMessage = ref('');

const editMode = ref(false);
const editableTables = ref([]);
const fileHandle = ref(null);
const fileName = ref('');

const dragActive = ref(false);
const fileInputRef = ref(null);

const DEFAULT_TABLE_ROW_LIMIT = 60;
const tableRowLimits = ref({});

let restoreLimitsAfterPrint = null;
const onAfterPrint = () => {
  if (restoreLimitsAfterPrint) {
    tableRowLimits.value = restoreLimitsAfterPrint;
    restoreLimitsAfterPrint = null;
  }
};

function formatDate(isoString) {
  if (!isoString || typeof isoString !== 'string') return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function typeLabel(type) {
  const t = String(type || '').trim();
  if (t === 'title') return '標題';
  if (t === 'date') return '日期';
  if (t === 'note') return '備註';
  if (t === 'heading') return '章節';
  if (t === 'content') return '內文';
  if (t === 'empty') return '空白';
  return t || '未分類';
}

function safeString(v) {
  if (v == null) return '';
  return String(v);
}

function cloneTables(tables) {
  if (!Array.isArray(tables)) return [];
  return tables.map((rows) =>
    Array.isArray(rows)
      ? rows.map((row) => (Array.isArray(row) ? row.map((cell) => safeString(cell)) : []))
      : []
  );
}

function parseAndLoad(text) {
  errorMessage.value = '';
  const trimmed = safeString(text).trim();
  if (!trimmed) {
    doc.value = null;
    rawJson.value = '';
    editableTables.value = [];
    fileName.value = '';
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    doc.value = null;
    errorMessage.value = `JSON 解析失敗：${err?.message || err}`;
    return;
  }

  if (!parsed || typeof parsed !== 'object') {
    doc.value = null;
    errorMessage.value = 'JSON 內容不是物件';
    return;
  }

  rawJson.value = trimmed;
  doc.value = parsed;
  editableTables.value = cloneTables(parsed?.tables);
  fileName.value = safeString(parsed?.source);
}

async function loadFromFile(file) {
  errorMessage.value = '';
  if (!file) return;
  const name = safeString(file.name).toLowerCase();
  if (!name.endsWith('.json')) {
    errorMessage.value = '請選擇 .json 檔案';
    return;
  }
  const text = await file.text();
  parseAndLoad(text);
}

async function openWritableFile() {
  errorMessage.value = '';
  if (!window.showOpenFilePicker) {
    errorMessage.value = '目前瀏覽器不支援可寫入檔案存取（建議使用 Chrome/Edge）';
    return;
  }

  try {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: [
        {
          description: 'JSON',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    const file = await handle.getFile();
    const text = await file.text();
    fileHandle.value = handle;
    fileName.value = safeString(file.name);
    parseAndLoad(text);
  } catch (err) {
    if (err?.name !== 'AbortError') {
      errorMessage.value = `開啟檔案失敗：${err?.message || err}`;
    }
  }
}

function onPickFileClick() {
  fileInputRef.value?.click?.();
}

function onFileChange(e) {
  const file = e?.target?.files?.[0];
  void loadFromFile(file);
  if (e?.target) e.target.value = '';
}

function onDragOver(e) {
  e.preventDefault();
  dragActive.value = true;
}

function onDragLeave() {
  dragActive.value = false;
}

function onDrop(e) {
  e.preventDefault();
  dragActive.value = false;
  const file = e?.dataTransfer?.files?.[0];
  void loadFromFile(file);
}

function clearAll() {
  rawJson.value = '';
  doc.value = null;
  errorMessage.value = '';
  editableTables.value = [];
  editMode.value = false;
  fileHandle.value = null;
  fileName.value = '';
}

function buildTablesAsObjects(tables) {
  if (!Array.isArray(tables)) return [];

  return tables.map((rows) => {
    if (!Array.isArray(rows) || !rows.length) return [];
    const maxCols = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)));
    const headerRow = rows[0] ?? [];
    const headers = [];
    for (let i = 0; i < maxCols; i++) {
      const raw = safeString(headerRow?.[i]).trim();
      headers.push(raw || getDefaultHeaderName(i));
    }

    return rows.slice(1).map((row) => {
      const obj = {};
      for (let i = 0; i < maxCols; i++) {
        const key = headers[i];
        obj[key] = row?.[i] !== undefined && row?.[i] !== null ? String(row[i]).trim() : '';
      }
      return obj;
    });
  });
}

function syncEditsToJson() {
  if (!doc.value) return;
  const updatedTables = cloneTables(editableTables.value);
  const updated = {
    ...doc.value,
    tables: updatedTables,
    tablesAsObjects: buildTablesAsObjects(updatedTables),
  };
  doc.value = updated;
  rawJson.value = JSON.stringify(updated, null, 2);
}

async function saveJsonToFile() {
  if (!doc.value) return;
  syncEditsToJson();

  const jsonText = rawJson.value || JSON.stringify(doc.value, null, 2);

  if (fileHandle.value?.createWritable) {
    const writable = await fileHandle.value.createWritable();
    await writable.write(jsonText);
    await writable.close();
    return;
  }

  if (window.showSaveFilePicker) {
    const handle = await window.showSaveFilePicker({
      suggestedName: fileName.value || doc.value?.source || 'quotation.json',
      types: [
        {
          description: 'JSON',
          accept: { 'application/json': ['.json'] },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(jsonText);
    await writable.close();
    fileHandle.value = handle;
    return;
  }

  const blob = new Blob([jsonText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.value || doc.value?.source || 'quotation.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toggleEditMode() {
  if (editMode.value) {
    syncEditsToJson();
    if (fileHandle.value?.createWritable) {
      void saveJsonToFile();
    }
  }
  editMode.value = !editMode.value;
}

function printPage() {
  if (!doc.value) return;

  // 列印時展開所有表格，避免分批渲染造成缺列。
  restoreLimitsAfterPrint = { ...tableRowLimits.value };
  const expanded = {};
  for (let i = 0; i < tables.value.length; i++) expanded[i] = Number.POSITIVE_INFINITY;
  tableRowLimits.value = expanded;

  void nextTick().then(() => {
    requestAnimationFrame(() => window.print());
  });
}

function getTableRowLimit(tableIndex) {
  const v = tableRowLimits.value?.[tableIndex];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (v === Number.POSITIVE_INFINITY) return v;
  return DEFAULT_TABLE_ROW_LIMIT;
}

function isTableExpanded(tableIndex) {
  return getTableRowLimit(tableIndex) === Number.POSITIVE_INFINITY;
}

function expandTable(tableIndex) {
  tableRowLimits.value = {
    ...tableRowLimits.value,
    [tableIndex]: Number.POSITIVE_INFINITY,
  };
}

function collapseTable(tableIndex) {
  tableRowLimits.value = {
    ...tableRowLimits.value,
    [tableIndex]: DEFAULT_TABLE_ROW_LIMIT,
  };
}

function showMoreRows(tableIndex, currentShown) {
  const next = Math.min(currentShown + 120, 10000);
  tableRowLimits.value = {
    ...tableRowLimits.value,
    [tableIndex]: next,
  };
}

const meta = computed(() => {
  const d = doc.value;
  return {
    source: safeString(d?.source),
    extractedAt: safeString(d?.extractedAt),
    extractedAtText: formatDate(d?.extractedAt),
    titleGuess: safeString(d?.paragraphs?.find?.((p) => p?.type === 'title')?.text),
  };
});

const titles = computed(() => {
  const d = doc.value;
  return Array.isArray(d?.titles) ? d.titles.map((t) => safeString(t).trim()).filter(Boolean) : [];
});

const paragraphs = computed(() => {
  const d = doc.value;
  if (!Array.isArray(d?.paragraphs)) return [];
  return d.paragraphs
    .map((p) => ({
      text: safeString(p?.text).trim(),
      type: safeString(p?.type).trim(),
    }))
    .filter((p) => p.text);
});

function normalizeHeaderRow(headerRow, colCount) {
  const headers = [];
  for (let i = 0; i < colCount; i++) {
    const raw = safeString(headerRow?.[i]).trim();
    headers.push(raw || getDefaultHeaderName(i));
  }
  return headers;
}

function getDefaultHeaderName(index) {
  if (index === 3) return '操作說明';
  if (index === 4) return '報價';
  return `欄位${index + 1}`;
}

function guessColumnWidth(header, index) {
  const h = safeString(header).trim();
  if (index === 0) return '7ch';
  if (/^(編號|序號|id|no\.?|項次)$/i.test(h)) return '7ch';
  if (/主功能|功能|項目/.test(h)) return '18ch';
  if (/說明|內容|描述|備註|規格|需求/.test(h)) return '44ch';
  return '';
}

function normalizeTableRows(table) {
  const rows = Array.isArray(table) ? table : [];
  const colCount = rows.length ? Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0))) : 0;
  if (!rows.length || colCount === 0) {
    return {
      colCount: 0,
      headers: [],
      body: [],
      colWidths: [],
      headerRow: [],
      visibleColumns: [],
      displayColCount: 0,
    };
  }

  const headerRow = rows[0];
  const headers = normalizeHeaderRow(headerRow, colCount);
  const colWidths = headers.map(guessColumnWidth);
  const visibleColumns = headers
    .map((header, index) => ({
      index,
      header: safeString(header).trim(),
      width: colWidths[index] || '',
    }))
    .filter((col) => col.header !== '報價');

  // body 保留原始列，顯示時再做 trim；避免一載入就把整張大表格全量轉換。
  const body = rows.slice(1);

  return {
    colCount,
    headers,
    body,
    colWidths,
    headerRow,
    visibleColumns,
    displayColCount: visibleColumns.length,
  };
}

function cellText(row, colIndex) {
  return safeString(row?.[colIndex]).trim();
}

function cellValue(row, colIndex) {
  return safeString(row?.[colIndex]);
}

function updateCell(tableIndex, rowIndex, colIndex, value) {
  const tables = editableTables.value;
  if (!tables?.[tableIndex]) return;
  if (!Array.isArray(tables[tableIndex][rowIndex])) tables[tableIndex][rowIndex] = [];
  tables[tableIndex][rowIndex][colIndex] = value;
}

const tables = computed(() => (Array.isArray(editableTables.value) ? editableTables.value : []));

const tableModels = computed(() => tables.value.map(normalizeTableRows));

const paragraphStats = computed(() => {
  const stats = new Map();
  for (const p of paragraphs.value) {
    const key = typeLabel(p.type);
    stats.set(key, (stats.get(key) || 0) + 1);
  }
  return [...stats.entries()].sort((a, b) => b[1] - a[1]);
});

onMounted(() => {
  // 預設提供一個空白模板，方便使用者直接貼上 JSON。
  rawJson.value = '';
  window.addEventListener('afterprint', onAfterPrint);
});

onBeforeUnmount(() => {
  window.removeEventListener('afterprint', onAfterPrint);
});
</script>

<template>
  <div class="app" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
    <header class="topbar">
      <div class="brand">
        <div class="brand__name">報價單 JSON Viewer</div>
        <div class="brand__sub">用擷取後的 JSON 還原可讀文件（段落 / 表格）</div>
      </div>
      <div class="topbar__actions">
        <button
          class="btn"
          type="button"
          @click="toggleEditMode"
          :disabled="!doc"
          :aria-pressed="editMode"
        >
          {{ editMode ? '完成編輯' : '編輯表格' }}
        </button>
        <button
          class="btn"
          type="button"
          @click="saveJsonToFile"
          :disabled="!doc"
        >
          儲存 JSON
        </button>
        <button class="btn" type="button" @click="printPage" :disabled="!doc">列印</button>
        <button class="btn btn--ghost" type="button" @click="clearAll" :disabled="!rawJson && !doc">清除</button>
      </div>
    </header>

    <main class="layout">
      <aside class="panel panel--controls" :class="{ 'panel--drag': dragActive }">
        <section class="card">
          <div class="card__title">載入 JSON</div>

          <div class="u-row">
            <input
              ref="fileInputRef"
              class="u-hidden"
              type="file"
              accept="application/json,.json"
              @change="onFileChange"
            />
            <button class="btn" type="button" @click="openWritableFile">開啟檔案</button>
            <div class="hint">或把 .json 檔拖放到此頁面</div>
          </div>

          <label class="field">
            <div class="field__label">貼上 JSON</div>
            <textarea
              v-model="rawJson"
              class="textarea"
              rows="10"
              spellcheck="false"
              placeholder="將 extract-docx 產生的 JSON 貼在這裡..."
            />
          </label>

          <div class="u-row u-row--end">
            <button class="btn" type="button" @click="parseAndLoad(rawJson)" :disabled="!rawJson.trim()">載入</button>
          </div>

          <div v-if="errorMessage" class="alert" role="alert">
            {{ errorMessage }}
          </div>
        </section>

        <section class="card" v-if="doc">
          <div class="card__title">文件資訊</div>
          <dl class="meta">
            <div class="meta__row">
              <dt>來源</dt>
              <dd class="mono" :title="meta.source">{{ meta.source || '（未知）' }}</dd>
            </div>
            <div class="meta__row">
              <dt>擷取時間</dt>
              <dd>{{ meta.extractedAtText || meta.extractedAt || '（未知）' }}</dd>
            </div>
            <div class="meta__row" v-if="meta.titleGuess">
              <dt>標題</dt>
              <dd>{{ meta.titleGuess }}</dd>
            </div>
          </dl>
        </section>

        <section class="card" v-if="doc">
          <div class="card__title">統計</div>
          <div class="stats">
            <div class="stat">
              <div class="stat__k">段落</div>
              <div class="stat__v">{{ paragraphs.length }}</div>
            </div>
            <div class="stat">
              <div class="stat__k">表格</div>
              <div class="stat__v">{{ tables.length }}</div>
            </div>
            <div class="stat">
              <div class="stat__k">章節</div>
              <div class="stat__v">{{ titles.length }}</div>
            </div>
          </div>

          <div class="chips" v-if="paragraphStats.length">
            <span class="chip" v-for="([k, v], idx) in paragraphStats" :key="idx">{{ k }}：{{ v }}</span>
          </div>
        </section>

        <section class="card card--tip">
          <div class="card__title">注意</div>
          <div class="tip">
            目前 JSON 會把段落、標題、表格分開輸出，因此此頁面以「內容區塊」方式還原；不保證完全等同 Word 的原始排版與順序。
          </div>
          <div class="tip tip--mt" v-if="doc">
            為避免大表格造成卡頓，表格預設僅顯示前 {{ DEFAULT_TABLE_ROW_LIMIT }} 列；可在每張表格下方展開或載入更多。
          </div>
        </section>
      </aside>

      <section class="panel panel--preview">
        <div v-if="!doc" class="empty">
          <div class="empty__title">尚未載入文件</div>
          <div class="empty__sub">請在左側選擇 JSON 檔案或貼上 JSON 後按「載入」。</div>
        </div>

        <article v-else class="doc">
          <header class="doc__head">
            <h1 class="doc__title">{{ meta.titleGuess || meta.source || '文件' }}</h1>
            <div class="doc__meta">
              <span v-if="meta.source" class="mono">{{ meta.source }}</span>
              <span v-if="meta.extractedAtText">擷取：{{ meta.extractedAtText }}</span>
            </div>
          </header>

          <section v-if="paragraphs.length" class="block">
            <h2 class="block__title">基本資訊</h2>
            <div class="paras">
              <div v-for="(p, i) in paragraphs" :key="i" class="para" :data-type="p.type">
                <div class="para__tag">{{ typeLabel(p.type) }}</div>
                <div class="para__text">{{ p.text }}</div>
              </div>
            </div>
          </section>

          <section v-if="tableModels.length" class="block">
            <h2 class="block__title">功能列表</h2>
            <div class="tables">
              <section v-for="(t, i) in tableModels" :key="i" class="tablewrap">
                <div v-if="titles[i]" class="tablewrap__chapter">
                  <div class="tablewrap__chapter-text">{{ titles[i] }}</div>
                  <div class="tablewrap__sub">{{ t.body.length }} 列資料</div>
                </div>
                <div v-else-if="titles.length > 1 && tableModels.length === 1 && i === 0" class="tablewrap__chapter">
                  <div class="tablewrap__chapter-pills">
                    <span v-for="(title, ti) in titles" :key="ti" class="chapterpill">{{ title }}</span>
                  </div>
                  <div class="tablewrap__sub">{{ t.body.length }} 列資料</div>
                </div>
                <div v-else class="tablewrap__chapter tablewrap__chapter--metaOnly">
                  <div class="tablewrap__chapter-text">&nbsp;</div>
                  <div class="tablewrap__sub">{{ t.body.length }} 列資料</div>
                </div>

                <div v-if="t.colCount === 0" class="hint">（空表格）</div>
                <div v-else class="scroll">
                  <table class="table">
                    <colgroup>
                      <col
                        v-for="(col, wi) in t.visibleColumns"
                        :key="wi"
                        :style="col.width ? { width: col.width } : null"
                      />
                    </colgroup>
                    <thead>
                      <tr>
                        <th v-for="(col, hi) in t.visibleColumns" :key="hi">
                          <input
                            v-if="editMode"
                            class="cell-input cell-input--header"
                            type="text"
                            :value="cellValue(t.headerRow, col.index)"
                            @input="updateCell(i, 0, col.index, $event.target.value)"
                          />
                          <span v-else>{{ col.header }}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(row, ri) in t.body.slice(0, isTableExpanded(i) ? t.body.length : getTableRowLimit(i))"
                        :key="ri"
                      >
                        <td v-for="(col, ci) in t.visibleColumns" :key="ci">
                          <input
                            v-if="editMode"
                            class="cell-input"
                            type="text"
                            :value="cellValue(row, col.index)"
                            @input="updateCell(i, ri + 1, col.index, $event.target.value)"
                          />
                          <span v-else>{{ cellText(row, col.index) }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-if="t.body.length > DEFAULT_TABLE_ROW_LIMIT" class="tablewrap__foot">
                  <div class="tablewrap__foot-left">
                    <span class="hint">
                      目前顯示
                      {{
                        isTableExpanded(i)
                          ? t.body.length
                          : Math.min(getTableRowLimit(i), t.body.length)
                      }}
                      / {{ t.body.length }}
                    </span>
                  </div>
                  <div class="tablewrap__foot-right">
                    <button
                      v-if="!isTableExpanded(i) && Math.min(getTableRowLimit(i), t.body.length) < t.body.length"
                      class="btn btn--small"
                      type="button"
                      @click="showMoreRows(i, Math.min(getTableRowLimit(i), t.body.length))"
                    >
                      顯示更多
                    </button>
                    <button
                      v-if="!isTableExpanded(i)"
                      class="btn btn--ghost btn--small"
                      type="button"
                      @click="expandTable(i)"
                    >
                      全部展開
                    </button>
                    <button
                      v-else
                      class="btn btn--ghost btn--small"
                      type="button"
                      @click="collapseTable(i)"
                    >
                      收合
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </section>

        </article>
      </section>
    </main>
  </div>
</template>
