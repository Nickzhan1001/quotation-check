#!/usr/bin/env node
/**
 * 擷取 .docx 內容並轉為 JSON
 *
 * 使用方式：
 *   node extract-docx-to-json.mjs [輸入.docx] [-o 輸出.json]
 *   node extract-docx-to-json.mjs
 *     → 預設輸入：quote-analysis/input/20251219_昶青碼頭系統功能報價單.docx
 *     → 預設輸出：quote-analysis/output/（檔名改為 .json）
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const DEFAULT_INPUT = path.join(
  PROJECT_ROOT,
  'quote-analysis',
  'input',
  '20251219_昶青碼頭系統功能報價單.docx'
);
const DEFAULT_OUTPUT_DIR = path.join(PROJECT_ROOT, 'quote-analysis', 'output');

/** 將可能是單一值、陣列、或數字鍵物件（解析器產物）正規化為陣列 */
function ensureArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (
    typeof value === 'object' &&
    Object.keys(value).every((k) => /^\d+$/.test(k))
  )
    return Object.keys(value)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => value[k]);
  return [value];
}

/** 確保值為物件，若為 null/undefined 或非物件則返回預設值 */
function ensureObject(value, defaultValue = {}) {
  if (value == null) return defaultValue;
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  return defaultValue;
}

/** 不往下遍歷的 OOXML 節點（屬性／樣式，非內文） */
const SKIP_KEYS = new Set([
  'w:rPr', 'w:pPr', 'w:tblPr', 'w:tcPr', 'w:trPr', 'w:sectPr',
  'w:drawing', 'w:pict', 'w:object', 'w:fldChar', 'w:instrText',
]);

/** 從節點遞迴收集所有 w:t 文字（支援巢狀與陣列，跳過屬性節點） */
function collectText(node, out = []) {
  if (node == null) return out;
  if (typeof node === 'string') {
    out.push(node);
    return out;
  }
  if (typeof node === 'number' || typeof node === 'boolean') {
    out.push(String(node));
    return out;
  }
  if (Array.isArray(node)) {
    for (const n of node) collectText(n, out);
    return out;
  }
  if (typeof node !== 'object') return out;
  if (Object.prototype.hasOwnProperty.call(node, 'w:t')) {
    const t = node['w:t'];
    if (typeof t === 'string') out.push(t);
    else if (Array.isArray(t)) for (const s of t) collectText(s, out);
    else if (t && typeof t === 'object') {
      const text = t['#text'] ?? t['_'];
      if (text !== undefined) out.push(String(text));
      else if (Object.keys(t).every((k) => /^\d+$/.test(k)))
        Object.values(t).forEach((v) => collectText(v, out));
    }
  }
  for (const key of Object.keys(node)) {
    if (key === 'w:t' || key.startsWith('@_') || SKIP_KEYS.has(key)) continue;
    collectText(node[key], out);
  }
  return out;
}

/** 移除 OOXML 常見雜訊：樣式用十六進位碼、字型名等（保留純數字如日期） */
function cleanText(s) {
  if (typeof s !== 'string') return s;
  return s
    .replace(/\b[0-9A-Fa-f]{8}\b/g, (m) => (/[A-Fa-f]/.test(m) ? '' : m))
    .replace(/\b(微軟正黑體|Times New Roman|Arial|eastAsia|Calibri|宋體|黑體)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyParagraph(text) {
  if (!text || text.trim() === '') return 'empty';

  if (/\d{4}[./-]\d{1,2}[./-]\d{1,2}/.test(text) || /日期[：:]\s*/.test(text)) {
    return 'date';
  }

  if (text.startsWith('※') || text.startsWith('★')) {
    return 'note';
  }

  if (/功能列表/.test(text) || /作業列表/.test(text)) {
    return 'heading';
  }

  if (text === '報 價 單' || /^報價\s*單$/.test(text)) {
    return 'title';
  }

  return 'content';
}

function getParagraphText(pNode) {
  const raw = collectText(pNode, []).join('').trim();
  const cleaned = cleanText(raw);
  return {
    text: cleaned,
    type: classifyParagraph(cleaned)
  };
}

function getCellText(tcNode) {
  const pNodes = ensureArray(tcNode['w:p']);
  if (!pNodes.length) return '';
  const raw = pNodes.map((p) => collectText(p, []).join('').trim()).filter(Boolean).join(' ');
  return cleanText(raw);
}

/** 取得表格cell的合併屬性 */
function getCellSpan(tcNode) {
  const tcPr = ensureObject(tcNode['w:tcPr']);
  const gridSpan = parseInt(tcPr['w:gridSpan']?.['@_w:val'] || tcPr['w:gridSpan']?.['@_w:val'] || 1, 10);
  const vMerge = tcPr['w:vMerge']?.['@_w:val'];
  return {
    gridSpan: isNaN(gridSpan) ? 1 : gridSpan,
    vMerge: vMerge || null
  };
}

/** 解析表格，正確處理合併單元格 */
function extractTable(tblNode) {
  const rowNodes = ensureArray(tblNode['w:tr']);
  const gridWidth = getTableGridWidth(tblNode);

  let prevVMergeState = [];
  const rows = [];

  for (const tr of rowNodes) {
    const cellNodes = ensureArray(tr['w:tc']);
    const row = [];
    let colIndex = 0;
    const currentVMergeState = [...prevVMergeState];

    for (let i = 0; i < cellNodes.length; i++) {
      const tc = cellNodes[i];
      const { gridSpan, vMerge } = getCellSpan(tc);
      const text = getCellText(tc);

      while (colIndex < currentVMergeState.length && currentVMergeState[colIndex]) {
        row.push('');
        colIndex++;
      }

      if (vMerge === 'continue' || vMerge === '1') {
        if (colIndex < prevVMergeState.length) {
          currentVMergeState[colIndex] = true;
          row.push(text || '');
        } else if (text) {
          row.push(text);
        } else {
          row.push('');
        }
      } else {
        currentVMergeState[colIndex] = false;
        for (let j = 0; j < gridSpan; j++) {
          if (j === 0) {
            row.push(text);
          } else {
            row.push('');
          }
        }
        colIndex += gridSpan;
      }
    }

    while (row.length < gridWidth) {
      row.push('');
    }

    rows.push(row);
    prevVMergeState = currentVMergeState;
  }

  return rows;
}

/** 取得表格的網格寬度（最大列數） */
function getTableGridWidth(tblNode) {
  const tblGrid = ensureObject(tblNode['w:tblGrid']);
  const gridCols = ensureArray(tblGrid['w:gridCol']);
  if (gridCols.length > 0) {
    return gridCols.length;
  }

  const rowNodes = ensureArray(tblNode['w:tr']);
  let maxCols = 0;
  for (const tr of rowNodes) {
    const cellNodes = ensureArray(tr['w:tc']);
    let rowCols = 0;
    for (const tc of cellNodes) {
      const { gridSpan } = getCellSpan(tc);
      rowCols += gridSpan;
    }
    maxCols = Math.max(maxCols, rowCols);
  }
  return maxCols || 3;
}

/** 將表格資料列轉成「第一列當標題」的物件陣列 */
function tableRowsToObjects(rows) {
  if (!rows.length) return [];
  const maxCols = Math.max(...rows.map(r => r.length));
  const headers = rows[0].map((cell, i) => {
    const header = cell?.trim();
    return header || `欄位${i + 1}`;
  });
  if (headers.length < maxCols) {
    for (let i = headers.length; i < maxCols; i++) {
      headers.push(`欄位${i + 1}`);
    }
  }
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] !== undefined && row[i] !== null ? String(row[i]).trim() : '';
    });
    return obj;
  });
}

function extractBody(body) {
  const pNodes = ensureArray(body['w:p'] ?? []);
  const tblNodes = ensureArray(body['w:tbl'] ?? []);

  const paragraphs = [];
  const titles = [];

  for (const pNode of pNodes) {
    const para = getParagraphText(pNode);
    if (para.type === 'heading') {
      titles.push(para.text);
    } else if (para.type !== 'empty') {
      paragraphs.push(para);
    }
  }

  const tablesRaw = ensureArray(body['w:tbl'] ?? []).map((tbl) => extractTable(tbl));

  const tables = tablesRaw;
  const tablesAsObjects = tables.map(tableRowsToObjects);

  return {
    paragraphs,
    titles: titles.length ? titles : undefined,
    tables,
    tablesAsObjects: tablesAsObjects.length ? tablesAsObjects : undefined,
  };
}

async function extractDocxToJson(docxPath) {
  const buf = await fs.readFile(docxPath);
  const zip = await JSZip.loadAsync(buf);
  const entry = zip.file('word/document.xml');
  if (!entry) throw new Error('docx 中找不到 word/document.xml');

  const documentXml = await entry.async('string');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) =>
      ['w:p', 'w:r', 'w:tbl', 'w:tr', 'w:tc', 'w:t'].includes(name),
  });
  const doc = parser.parse(documentXml);
  const body = doc['w:document']?.['w:body'];
  if (!body) throw new Error('document.xml 中找不到 w:body');

  const extracted = extractBody(body);
  return {
    source: path.basename(docxPath),
    extractedAt: new Date().toISOString(),
    ...extracted,
  };
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let inputPath = null;
  let outputPath = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-o' || args[i] === '--output') {
      outputPath = args[++i] ?? null;
    } else if (!args[i].startsWith('-')) {
      inputPath = args[i];
    }
  }
  return {
    inputPath: inputPath ? path.resolve(inputPath) : DEFAULT_INPUT,
    outputPath: outputPath
      ? path.resolve(outputPath)
      : null,
  };
}

async function main() {
  const { inputPath, outputPath } = parseArgs(process.argv);
  const resolvedOutput =
    outputPath ||
    path.join(DEFAULT_OUTPUT_DIR, path.basename(inputPath, '.docx') + '.json');

  try {
    await fs.access(inputPath);
  } catch {
    console.error('錯誤：找不到檔案');
    console.error('  路徑：', inputPath);
    console.error('請確認檔案是否存在，或使用正確的路徑');
    process.exit(1);
  }

  const inputExt = path.extname(inputPath).toLowerCase();
  if (inputExt !== '.docx') {
    console.error('錯誤：輸入檔案必須是 .docx 格式');
    console.error('  偵測到副檔名：', inputExt);
    process.exit(1);
  }

  try {
    await fs.mkdir(path.dirname(resolvedOutput), { recursive: true });
    const json = await extractDocxToJson(inputPath);
    await fs.writeFile(resolvedOutput, JSON.stringify(json, null, 2), 'utf8');
    console.log('已完成，輸出至：', resolvedOutput);
    console.log('  段落數量：', json.paragraphs?.length || 0);
    console.log('  表格數量：', json.tables?.length || 0);
  } catch (err) {
    console.error('錯誤：擷取失敗');
    console.error('  訊息：', err.message);
    process.exit(1);
  }
}

main();
