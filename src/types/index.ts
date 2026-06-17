export interface DiffResult {
  type: "same" | "missing" | "extra" | "replace";
  char?: string;
  from?: string;
  to?: string;
}

export interface NormalizedData {
  raw: string;
  normalized: string;
  map: number[];
}

export interface ScrollPosition {
  panel: "original" | "checked";
  position: number;
}
