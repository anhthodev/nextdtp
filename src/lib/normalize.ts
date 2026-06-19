import { normalizeText } from "@/lib/utils";
import type { NormalizedData, DiffResult } from "@/types";

export function normalizeForCompare(text: string): NormalizedData {
  const raw = normalizeText(text);

  const normalizedChars: string[] = [];
  const indexMap: number[] = [];
  const whitespaceRegex = /[\s\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/;
  const invisibleRegex =
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u00AD\u200B\u200C\u200D\u2060\u2061\u2062\u2063\u206A-\u206F\uFEFF\uFFF9-\uFFFB]/g;
  const urlRegex = /https?:\/\/[^\s<>\)\(\[\]]+/gi;

  function toAsciiChars(char: string): string[] {
    const code = char.charCodeAt(0);

    const additionalMap: Record<number, string> = {
      0x2ed1: "長",
    };

    if (additionalMap[code]) {
      return [additionalMap[code]];
    }

    if (code === 0x3000) {
      return [" "];
    }

    if (char === "…" || char === "‥" || char === "。" || char === "｡" || char === "．") {
      return [char];
    }

    if (char === "、" || char === "､") {
      return [char];
    }

    if (char === "，") {
      return [char];
    }

    if (char === "（") {
      return [char];
    }

    if (char === "）") {
      return [char];
    }

    if (
      char === "ー" ||
      char === "ｰ" ||
      char === "−" ||
      char === "–" ||
      char === "—" ||
      char === "〜" ||
      char === "～"
    ) {
      return [char];
    }

    if (char === "・" || char === "･") {
      return [char];
    }

    if (
      char === "｢" ||
      char === "｣" ||
      char === "「" ||
      char === "」" ||
      char === "『" ||
      char === "』"
    ) {
      return [char];
    }

    if (
      char === "＜" ||
      char === "＞" ||
      char === "【" ||
      char === "】" ||
      char === "〈" ||
      char === "〉" ||
      char === "《" ||
      char === "》" ||
      char === "〔" ||
      char === "〕"
    ) {
      return [char];
    }

    if (char === "¥" || char === "￥") {
      return ["¥"];
    }

    if (char === "：" || char === "；" || char === "？" || char === "！") {
      return [char];
    }

    if (char === "'" || char === "'") {
      return ["'"];
    }

    if (char === "\u201C" || char === "\u201D") {
      return ['"'];
    }

    if (code >= 0xff01 && code <= 0xff5e) {
      return [String.fromCharCode(code - 0xfee0)];
    }

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

  const bracketCleaned = cleaned;

  const urlRanges: Array<{ start: number; end: number; text: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(bracketCleaned)) !== null) {
    urlRanges.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
    });
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

    if (whitespaceRegex.test(char)) {
      continue;
    }

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

  return {
    raw: bracketCleaned,
    normalized: normalizedChars.join(""),
    map: indexMap,
  };
}

export function diff(a: string, b: string): DiffResult[] {
  const m = a.length;
  const n = b.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const result: DiffResult[] = [];
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

  const merged: DiffResult[] = [];
  for (let k = 0; k < result.length; k++) {
    const op = result[k];
    const next = result[k + 1];

    const isBracket =
      bracketChars.has(op.char || "") || (next && bracketChars.has(next.char || ""));

    if (!isBracket && op.type === "missing" && next?.type === "extra") {
      merged.push({
        type: "replace",
        from: op.char,
        to: next.char,
      });
      k++;
      continue;
    }

    merged.push(op);
  }

  return merged;
}

export function safeRender(text: string | null): string {
  return (text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "")
    .replace(/\n/g, "<br>")
    .replace(/\t/g, "    ");
}
