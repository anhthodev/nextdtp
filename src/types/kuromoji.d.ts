declare module "kuromoji" {
  export interface KuromojiToken {
    surface_form: string;
  }

  export interface KuromojiTokenizer {
    tokenize(input: string): KuromojiToken[];
  }

  export interface KuromojiBuilder {
    build(callback: (err: Error | null, tokenizer: KuromojiTokenizer) => void): void;
  }

  export interface KuromojiBuilderOptions {
    dicPath: string;
  }

  export function builder(options: KuromojiBuilderOptions): KuromojiBuilder;

  const kuromoji: {
    builder(options: KuromojiBuilderOptions): KuromojiBuilder;
  };

  export default kuromoji;
}
