// Utility to calculate optimal line breaks for Japanese text.
// Algorithm summary:
// 1. Tokenize input text using kuromoji via the API route when available.
//    Fallback to Intl.Segmenter (word granularity) and then per-character tokens.
// 2. Measure string widths using an offscreen Canvas with the desired font.
// 3. Use dynamic programming to partition tokens into `L` lines that minimize
//    the sum of squared deviations from the ideal line width (totalWidth / L).
//    This tends to produce balanced line lengths while preserving token boundaries.
// 4. Reconstruct the best partition, measure each resulting line exactly and
//    return metadata (line strings, widths, overflow flag).

export type CalcOptions = {
  width: number; // box width in px
  height: number; // box height in px
  fontFamily: string;
  fontSizePt: number; // in points
  space?: number; // px tolerance for keeping semantically linked tokens together
  targetLines: number;
  lineHeight: number;
  preservePhrases?: boolean;
};

export type CalcResult = {
  lines: string[];
  lineWidths: number[]; // px
  perLineTokens?: string[][]; // tokens composing each line
  perLineTokenWidths?: number[][]; // widths per token
  perLineIndents?: number[]; // px indent for each line
  totalLines: number;
  overflow: boolean;
};

type KuromojiToken = {
  surface_form: string;
};

const kuromojiTokenCache = new Map<string, string[]>();

function ptToPx(pt: number) {
  // 1pt = 1.333333px (96/72)
  return (pt * 96) / 72;
}

function createMeasurer(fontFamily: string, fontSizePt: number) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fontSizePx = ptToPx(fontSizePt);
  // use normal weight and style — caller can provide font family string
  ctx.font = `${fontSizePx}px ${fontFamily}`;
  ctx.textBaseline = "alphabetic";

  return (s: string) => Math.max(0, Math.ceil(ctx.measureText(s).width));
}

function splitNewlineTokens(token: string): string[] {
  return token.split(/(\r\n|\r|\n)/g).filter(Boolean);
}

async function tokenizeJapanese(text: string): Promise<string[]> {
  const cachedTokens = kuromojiTokenCache.get(text);
  if (cachedTokens) {
    return cachedTokens;
  }

  try {
    const response = await fetch("/api/kuromoji/tokenize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const data = (await response.json()) as { tokens?: KuromojiToken[] };
      const kuromojiTokens = (data.tokens ?? []).map((token) => token.surface_form).filter(Boolean);

      if (kuromojiTokens.length > 0) {
        const normalizedTokens = kuromojiTokens
          .flatMap((token) => splitNewlineTokens(token))
          .filter(Boolean);
        kuromojiTokenCache.set(text, normalizedTokens);
        return normalizedTokens;
      }
    }
  } catch {
    // fall through to fallback
  }

  const tokens: string[] = [];

  const segmenterCtor = (
    Intl as typeof Intl & {
      Segmenter?: new (
        locales?: string | string[],
        options?: Intl.SegmenterOptions
      ) => {
        segment: (input: string) => Iterable<{ segment: string }>;
      };
    }
  ).Segmenter;

  if (typeof segmenterCtor === "function") {
    try {
      const seg = new segmenterCtor("ja", { granularity: "word" });
      for (const segItem of seg.segment(text)) {
        tokens.push(segItem.segment);
      }
    } catch {
      // fall through to fallback
    }
  }

  if (tokens.length > 0) {
    const normalizedTokens = tokens.flatMap((token) => splitNewlineTokens(token)).filter(Boolean);
    kuromojiTokenCache.set(text, normalizedTokens);
    return normalizedTokens;
  }

  const fallbackTokens = Array.from(text);
  kuromojiTokenCache.set(text, fallbackTokens);
  return fallbackTokens;
}

// Main calculation function
export async function calculateOptimalBreaks(
  input: string,
  opts: CalcOptions
): Promise<CalcResult> {
  const {
    width: boxWidth,
    height: boxHeight,
    fontFamily,
    fontSizePt,
    space = 0,
    targetLines,
    lineHeight,
    preservePhrases,
  } = opts;

  const newlineRegex = /\r\n|\r|\n/;

  // Tokenize preserving Japanese words when possible.
  // If the target line count is higher than the number of Japanese word tokens,
  // fallback to per-character tokens so the text can still break into more lines.
  const tokens = await tokenizeJapanese(input);
  const normalizedNewlines = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const charTokens = Array.from(normalizedNewlines);
  // Merge helper: avoid lines that start with single-character particles or
  // small kana by attaching them to the previous token when possible.
  const particles = new Set([
    "は",
    "が",
    "を",
    "に",
    "へ",
    "と",
    "も",
    "から",
    "まで",
    "で",
    "より",
    "や",
    "の",
    "ね",
    "よ",
    "ぞ",
    "ぜ",
  ]);
  const honorificPrefixes = new Set(["ご", "お", "御"]);
  const smallKana = new Set([
    "ぁ",
    "ぃ",
    "ぅ",
    "ぇ",
    "ぉ",
    "ゃ",
    "ゅ",
    "ょ",
    "っ",
    "ゎ",
    "ァ",
    "ィ",
    "ゥ",
    "ェ",
    "ォ",
    "ャ",
    "ュ",
    "ョ",
    "ッ",
    "ヮ",
  ]);

  // Decide active tokenization strategy.
  let activeTokens: string[] = tokens;

  if (targetLines > tokens.length) {
    if (preservePhrases === false) {
      // User prefers not to preserve phrases: fall back to characters.
      activeTokens = charTokens;
    } else {
      // Try to split tokens at natural punctuation boundaries first,
      // then into small chunks if still not enough pieces.
      const punctRegex = /[。．.!！？?、,，]/;
      const subTokens: string[] = [];

      for (const t of tokens) {
        if (punctRegex.test(t)) {
          // split keeping punctuation attached to preceding segment
          let acc = "";
          for (const ch of t) {
            acc += ch;
            if (punctRegex.test(ch)) {
              subTokens.push(acc);
              acc = "";
            }
          }
          if (acc.length > 0) subTokens.push(acc);
        } else if (t.length > 6) {
          // long token: chunk into pieces of up to 4 chars
          for (let i = 0; i < t.length; i += 4) {
            subTokens.push(t.slice(i, i + 4));
          }
        } else {
          subTokens.push(t);
        }
      }

      // If subTokens still too few, fall back to characters
      activeTokens = subTokens.length >= targetLines ? subTokens : charTokens;
    }
  }

  // If preserving phrases, post-process tokens to merge undesirable line-leading pieces.
  if (activeTokens.length > 0) {
    const merged: string[] = [];
    for (let index = 0; index < activeTokens.length; index++) {
      const t = activeTokens[index];
      if (t.match(newlineRegex)) {
        merged.push(t);
        continue;
      }

      if (honorificPrefixes.has(t)) {
        const nextToken = activeTokens[index + 1];
        if (nextToken && !nextToken.match(newlineRegex)) {
          merged.push(t + nextToken);
          index += 1;
          continue;
        }
      }

      if (particles.has(t) && merged.length > 0) {
        // attach particle to previous token
        merged[merged.length - 1] = merged[merged.length - 1] + t;
        continue;
      }

      const isSingleHiragana = /^\p{Script=Hiragana}$/u.test(t);
      if (((t.length === 1 && smallKana.has(t)) || isSingleHiragana) && merged.length > 0) {
        // attach small kana or single hiragana (verb endings like 'る') to previous token
        merged[merged.length - 1] = merged[merged.length - 1] + t;
        continue;
      }

      merged.push(t);
    }

    // use merged tokens as the token stream
    activeTokens = merged;
  }

  // If no tokens (empty string), return empty
  if (activeTokens.length === 0) {
    return { lines: [], lineWidths: [], totalLines: 0, overflow: false };
  }

  const measure = createMeasurer(fontFamily, fontSizePt);

  const n = activeTokens.length;
  let L = Math.max(1, Math.min(targetLines, n));

  // Precompute concatenated strings and widths for every token span using activeTokens.
  const spanText: string[][] = Array.from({ length: n }, () => []);
  const spanWidth: number[][] = Array.from({ length: n }, () => []);
  const spanHasNewline: boolean[][] = Array.from({ length: n }, () => []);
  const spanEndsWithNewline: boolean[][] = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    let acc = "";
    let accNoNewline = "";
    let hasNewline = false;

    for (let j = i; j < n; j++) {
      const tok = activeTokens[j];
      acc += tok;
      accNoNewline += tok.replace(newlineRegex, "");
      if (tok.match(newlineRegex)) {
        hasNewline = true;
      }

      spanText[i][j] = acc;
      spanWidth[i][j] = measure(accNoNewline);
      spanHasNewline[i][j] = hasNewline;
      spanEndsWithNewline[i][j] = Boolean(tok.match(newlineRegex));
    }
  }

  // Ideal width target per line for balancing
  const totalWidth = spanWidth[0][n - 1] || 0;
  const ideal = totalWidth / L;
  const spaceTolerance = Math.max(0, space);

  // dp[k][i] = minimal cost to split first i tokens (0..i-1) into k lines
  // We'll use 1-based for k, and i from 1..n
  const INF = 1e18;
  const dp: number[][] = Array.from({ length: L + 1 }, () => Array(n + 1).fill(INF));
  const split: number[][] = Array.from({ length: L + 1 }, () => Array(n + 1).fill(-1));

  dp[0][0] = 0;

  for (let k = 1; k <= L; k++) {
    for (let i = 1; i <= n; i++) {
      // consider previous break at p (tokens 0..p-1 used by k-1 lines), current line p..i-1
      for (let p = k - 1; p <= i - 1; p++) {
        const w = spanWidth[p][i - 1] ?? 0;
        // cost: squared deviation from ideal width
        const deviation = Math.max(0, Math.abs(w - ideal) - spaceTolerance);
        const newlinePenalty =
          spanHasNewline[p][i - 1] && !spanEndsWithNewline[p][i - 1]
            ? Math.pow(Math.max(18, boxWidth * 0.12), 2)
            : 0;
        const c = Math.pow(deviation, 2) + newlinePenalty;
        const candidate = dp[k - 1][p] + c;
        if (candidate < dp[k][i]) {
          dp[k][i] = candidate;
          split[k][i] = p;
        }
      }
    }
  }

  // If dp[L][n] is still INF, find the largest k' <= L with a finite dp[k'][n]
  if (dp[L][n] === INF) {
    let found = -1;
    for (let kk = L - 1; kk >= 1; kk--) {
      if (dp[kk][n] < INF) {
        found = kk;
        break;
      }
    }
    if (found !== -1) {
      // reduce L to the largest feasible line count
      L = found;
    } else {
      // as a last resort, allow one token per line
      L = Math.min(n, Math.max(1, L));
      // initialize trivial splits: each line takes one token
      for (let kk = 1; kk <= L; kk++) {
        for (let ii = 0; ii <= n; ii++) {
          split[kk][ii] = Math.max(0, ii - 1);
        }
      }
    }
  }

  // Reconstruct partitions for L lines
  const lines: string[] = [];
  const lineWidths: number[] = [];
  const perLineTokens: string[][] = [];
  const perLineTokenWidths: number[][] = [];
  let i = n;
  let k = L;
  while (k > 0) {
    let p = split[k][i];
    if (typeof p !== "number" || p < 0) {
      p = Math.max(0, i - 1);
    }
    const rawText = spanText[p][i - 1] ?? "";
    const text = rawText.replace(/\r\n|\r|\n/g, "");
    lines.unshift(text);
    lineWidths.unshift(spanWidth[p][i - 1] ?? 0);
    // gather tokens and token widths for this line
    const toks: string[] = [];
    const toksW: number[] = [];
    for (let t = p; t <= i - 1; t++) {
      toks.push(activeTokens[t]);
      // width of token alone
      toksW.push(spanWidth[t][t] ?? measure(activeTokens[t]));
    }
    perLineTokens.unshift(toks);
    perLineTokenWidths.unshift(toksW);
    i = p;
    k -= 1;
  }

  // If targetLines > actual number of non-empty lines (shouldn't happen), adjust
  const finalLines = lines.length;

  // Compute per-line indents for continuation tokens: if a line begins with a
  // marker (e.g., '※') or a small continuation token and the previous line does
  // not end with terminal punctuation, indent the line so its first character
  // aligns under the first character of the previous line.
  const perLineIndents: number[] = new Array(finalLines).fill(0);
  const terminalRegex = /[。．.!！？?]/;
  for (let idx = 1; idx < finalLines; idx++) {
    const firstTok = perLineTokens[idx][0] ?? "";
    const prevLine = lines[idx - 1] ?? "";
    const prevEndsTerminal = terminalRegex.test(prevLine.trim().slice(-1));

    // marker at start or small continuation tokens
    const isMarker = firstTok.startsWith("※") || firstTok.startsWith("・");
    const isSmallCont =
      (firstTok.length <= 2 && smallKana.has(firstTok)) || particles.has(firstTok);

    if (!prevEndsTerminal && (isMarker || isSmallCont)) {
      // measure width of first character of previous line's first token
      const prevFirst = perLineTokens[idx - 1][0] ?? "";
      const firstChar = prevFirst ? Array.from(prevFirst)[0] : "";
      if (firstChar) {
        perLineIndents[idx] = measure(firstChar);
      }
    }
  }

  // Compute height used (approx): lineHeight multiplier 1.2
  const fontSizePx = ptToPx(fontSizePt);
  const lineHeightPx = Math.ceil(fontSizePx * lineHeight);
  const usedHeight = finalLines * lineHeightPx;
  const overflow = usedHeight > boxHeight || lineWidths.some((w) => w > boxWidth);

  return {
    lines,
    lineWidths,
    perLineTokens,
    perLineTokenWidths,
    perLineIndents,
    totalLines: finalLines,
    overflow,
  };
}

export default calculateOptimalBreaks;
