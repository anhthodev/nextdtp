const fs = require("fs");
const source = "đây là input đưa vào asssss";
const target = "đây là kiểm tra asssss";
const normalizeText = (s) => s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
const whitespaceRegex = /[\s\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/;
const invisibleRegex =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u00AD\u200B\u200C\u200D\u2060\u2061\u2062\u2063\u206A-\u206F\uFEFF\uFFF9-\uFFFB]/g;
const urlRegex = /https?:\/\/[^\s<>\)\(\[\]]+/gi;
function toAsciiChars(char) {
  const code = char.charCodeAt(0);
  if (code === 0x2ed1) return ["長"];
  if (code === 0x3000) return [" "];
  if ("…‥。｡．、､，（）＜＞【】〈〉《》〔〕ーｰ−–—〜～・･｢｣「」『』：；？！".includes(char))
    return [char];
  if (char === "¥" || char === "￥") return ["¥"];
  if (char === "" || char === "") return ['"'];
  if (code >= 0xff01 && code <= 0xff5e) return [String.fromCharCode(code - 0xfee0)];
  return [char];
}
function normalizeForCompare(text) {
  const raw = normalizeText(text);
  const normalizedChars = [];
  const indexMap = [];
  const cleaned = raw.replace(invisibleRegex, "");
  const preserveFullwidthPunctuation = new Set([
    "…",
    "‥",
    "。",
    "｡",
    "．",
    "、",
    "､",
    "，",
    "（",
    "）",
    "＜",
    "＞",
    "【",
    "】",
    "〈",
    "〉",
    "《",
    "》",
    "〔",
    "〕",
    "～",
    "ー",
    "ｰ",
    "−",
    "–",
    "—",
    "〜",
    "・",
    "･",
    "｢",
    "｣",
    "「",
    "」",
    "『",
    "』",
    "：",
    "；",
    "？",
    "！",
  ]);
  let bracketCleaned = cleaned;
  const urlRanges = [];
  for (const m of bracketCleaned.matchAll(urlRegex)) {
    urlRanges.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
  }
  let urlPtr = 0;
  for (let i = 0; i < bracketCleaned.length; i++) {
    if (urlPtr < urlRanges.length && i === urlRanges[urlPtr].start) {
      const txt = urlRanges[urlPtr].text;
      for (let k = 0; k < txt.length; k++) {
        normalizedChars.push(txt[k]);
        indexMap.push(i + k);
      }
      i = urlRanges[urlPtr].end - 1;
      urlPtr++;
      continue;
    }
    const char = bracketCleaned[i];
    if (whitespaceRegex.test(char)) continue;
    if (preserveFullwidthPunctuation.has(char)) {
      const asciiChars = toAsciiChars(char);
      for (const finalChar of asciiChars) {
        normalizedChars.push(finalChar);
        indexMap.push(i);
      }
      continue;
    }
    const normalizedCharInput = char.normalize("NFKC");
    for (const normalizedChar of normalizedCharInput) {
      const asciiChars = toAsciiChars(normalizedChar);
      for (const finalChar of asciiChars) {
        normalizedChars.push(finalChar);
        indexMap.push(i);
      }
    }
  }
  return { raw: bracketCleaned, normalized: normalizedChars.join(""), map: indexMap };
}
function diff(a, b) {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result = [];
  let i = 0,
    j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      result.push({ type: "same", char: a[i] });
      i++;
      j++;
      continue;
    }
    if (dp[i + 1][j] >= dp[i][j + 1]) {
      result.push({ type: "missing", char: a[i] });
      i++;
    } else {
      result.push({ type: "extra", char: b[j] });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: "missing", char: a[i] });
    i++;
  }
  while (j < n) {
    result.push({ type: "extra", char: b[j] });
    j++;
  }
  const bracketChars = new Set([
    "（",
    "）",
    "＜",
    "＞",
    "【",
    "】",
    "〈",
    "〉",
    "《",
    "》",
    "〔",
    "〕",
    "｢",
    "｣",
    "「",
    "」",
    "『",
    "』",
  ]);
  const merged = [];
  for (let k = 0; k < result.length; k++) {
    const op = result[k];
    const next = result[k + 1];
    const isBracket =
      bracketChars.has(op.char || "") || (next && bracketChars.has(next.char || ""));
    if (!isBracket && op.type === "missing" && next?.type === "extra") {
      merged.push({ type: "replace", from: op.char, to: next.char });
      k++;
      continue;
    }
    merged.push(op);
  }
  return merged;
}
const originalData = normalizeForCompare(source);
const testData = normalizeForCompare(target);
const diffs = diff(originalData.normalized, testData.normalized);
function renderResult(data, panel) {
  const nodes = [];
  let originalIndex = 0;
  let testIndex = 0;
  let originalRawPos = 0;
  let testRawPos = 0;
  const flushRawLeft = (targetRawIndex) => {
    while (originalRawPos < targetRawIndex) {
      nodes.push({
        char: originalData.raw[originalRawPos],
        position: originalRawPos,
        kind: "rawLeft",
      });
      originalRawPos++;
    }
  };
  const flushRawRight = (targetRawIndex) => {
    while (testRawPos < targetRawIndex) {
      nodes.push({ char: testData.raw[testRawPos], position: testRawPos, kind: "rawRight" });
      testRawPos++;
    }
  };
  const renderToken = (char, className, position, tokenType = "char") => ({
    char,
    position,
    tokenType,
  });
  if (originalData.normalized === testData.normalized) {
    for (let i = 0; i < data.raw.length; i++) {
      nodes.push(renderToken(data.raw[i], undefined, i));
    }
  } else {
    diffs.forEach((d) => {
      if (d.type === "same") {
        const originalPos = originalData.map[originalIndex];
        const testPos = testData.map[testIndex];
        if (originalPos !== undefined && testPos !== undefined) {
          if (panel === "original" && originalPos >= originalRawPos) {
            flushRawLeft(originalPos);
            nodes.push(renderToken(originalData.raw[originalPos], undefined, originalPos));
            originalRawPos = originalPos + 1;
          }
          if (panel === "checked" && testPos >= testRawPos) {
            flushRawRight(testPos);
            nodes.push(renderToken(testData.raw[testPos], undefined, testPos));
            testRawPos = testPos + 1;
          }
        }
        originalIndex++;
        testIndex++;
        return;
      }
      if (d.type === "extra") {
        const testPos = testData.map[testIndex];
        if (panel === "checked" && testPos !== undefined && testPos >= testRawPos) {
          flushRawRight(testPos);
          nodes.push(renderToken(testData.raw[testPos], "extra", testPos));
          testRawPos = testPos + 1;
        }
        testIndex++;
        return;
      }
      if (d.type === "missing") {
        const originalPos = originalData.map[originalIndex];
        if (panel === "original" && originalPos !== undefined && originalPos >= originalRawPos) {
          flushRawLeft(originalPos);
          nodes.push(renderToken(originalData.raw[originalPos], "missing", originalPos));
          originalRawPos = originalPos + 1;
        }
        if (panel === "checked" && originalPos !== undefined) {
          const missingChar = originalData.raw[originalPos];
          nodes.push(renderToken(missingChar, "missing", originalPos, "missing"));
        }
        originalIndex++;
        return;
      }
      if (d.type === "replace") {
        const originalPos = originalData.map[originalIndex];
        const testPos = testData.map[testIndex];
        if (originalPos !== undefined && testPos !== undefined) {
          if (panel === "original" && originalPos >= originalRawPos) {
            flushRawLeft(originalPos);
            nodes.push(renderToken(originalData.raw[originalPos], "replace", originalPos));
            originalRawPos = originalPos + 1;
          }
          if (panel === "checked" && testPos >= testRawPos) {
            flushRawRight(testPos);
            nodes.push(renderToken(testData.raw[testPos], "replace", testPos));
            testRawPos = testPos + 1;
          }
        }
        originalIndex++;
        testIndex++;
        return;
      }
    });
  }
  flushRawLeft(originalData.raw.length);
  flushRawRight(testData.raw.length);
  return nodes;
}
const resultChecked = renderResult(testData, "checked");
console.log(
  "checked",
  resultChecked.map((n) => `${n.position}:${n.char}:${n.tokenType}`).join("|")
);
const resultOriginal = renderResult(originalData, "original");
console.log(
  "original",
  resultOriginal.map((n) => `${n.position}:${n.char}:${n.tokenType}`).join("|")
);
