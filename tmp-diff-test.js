const source = "đây là input đưa vào asssss";
const target = "đây là kiểm tra asssss";

function normalizeText(s) {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function normalizeForCompare(text) {
  const raw = normalizeText(text);
  const normalizedChars = [];
  const indexMap = [];
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
    if (char === "\u201C" || char === "\u201D") return ['"'];
    if (code >= 0xff01 && code <= 0xff5e) return [String.fromCharCode(code - 0xfee0)];
    return [char];
  }

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
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result = [];
  let i = 0;
  let j = 0;
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

const o = normalizeForCompare(source);
const t = normalizeForCompare(target);
console.log("source raw=", JSON.stringify(o.raw));
console.log("target raw=", JSON.stringify(t.raw));
console.log("source normalized=", JSON.stringify(o.normalized));
console.log("target normalized=", JSON.stringify(t.normalized));
console.log("map source=", JSON.stringify(o.map));
console.log("map target=", JSON.stringify(t.map));
console.log("diffs=", JSON.stringify(diff(o.normalized, t.normalized), null, 2));
