import path from "path";
import kuromoji from "kuromoji";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type KuromojiToken = {
  surface_form: string;
};

let tokenizerPromise: Promise<{ tokenize(input: string): KuromojiToken[] }> | null = null;

function getTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: path.join(process.cwd(), "node_modules", "kuromoji", "dict") })
        .build((err, tokenizer) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(tokenizer);
        });
    });
  }

  return tokenizerPromise;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string };
    const text = typeof body.text === "string" ? body.text : "";

    if (!text) {
      return NextResponse.json({ tokens: [] });
    }

    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text).map((token) => ({ surface_form: token.surface_form }));

    return NextResponse.json({ tokens });
  } catch {
    return NextResponse.json({ tokens: [] }, { status: 200 });
  }
}
