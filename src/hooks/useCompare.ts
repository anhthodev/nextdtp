"use client";

import { useState, useCallback, useEffect } from "react";
import { normalizeForCompare, diff } from "@/lib/normalize";
import { stripControlChars } from "@/lib/utils";
import type { DiffResult, NormalizedData } from "@/types";

export interface CompareResult {
  originalData: NormalizedData;
  testData: NormalizedData;
  diffs: DiffResult[];
  hasError: boolean;
}

export function useCompare(sourceText: string, targetText: string): CompareResult {
  const [result, setResult] = useState<CompareResult>({
    originalData: { raw: "", normalized: "", map: [] },
    testData: { raw: "", normalized: "", map: [] },
    diffs: [],
    hasError: false,
  });

  const compare = useCallback(() => {
    const cleanedSource = stripControlChars(sourceText);
    const cleanedTarget = stripControlChars(targetText);

    const originalData = normalizeForCompare(cleanedSource);
    const testData = normalizeForCompare(cleanedTarget);

    const diffs = diff(originalData.normalized, testData.normalized);
    const hasError = diffs.some(
      (d) => d.type === "missing" || d.type === "extra" || d.type === "replace"
    );

    setResult({
      originalData,
      testData,
      diffs,
      hasError,
    });
  }, [sourceText, targetText]);

  useEffect(() => {
    compare();
  }, [sourceText, targetText, compare]);

  return result;
}
