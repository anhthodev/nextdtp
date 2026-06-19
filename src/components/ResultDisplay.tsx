"use client";

import { cn } from "@/lib/utils";
import type { NormalizedData, DiffResult } from "@/types";

interface ResultDisplayProps {
  originalData: NormalizedData;
  testData: NormalizedData;
  diffs: DiffResult[];
  isCollapsed: boolean;
  isEditMode: boolean;
  fontSize?: "small" | "medium" | "large";
  fontFamily?: string;
  originalFontFamily?: string;
  originalFontWeight?: number;
  testFontFamily?: string;
  testFontWeight?: number;
  selectedToken: {
    panel: "original" | "checked";
    position: number;
    type: "char" | "missing";
  } | null;
  onCharClick?: (
    panel: "original" | "checked",
    position: number,
    type?: "char" | "missing"
  ) => void;
}

interface ResultPanelProps {
  data: NormalizedData;
  panel: "original" | "checked";
  isCollapsed: boolean;
  isEditMode: boolean;
  fontSize: "small" | "medium" | "large";
  fontFamily?: string;
  originalFontFamily?: string;
  originalFontWeight?: number;
  testFontFamily?: string;
  testFontWeight?: number;
  selectedToken: {
    panel: "original" | "checked";
    position: number;
    type: "char" | "missing";
  } | null;
  onCharClick?: (
    panel: "original" | "checked",
    position: number,
    type?: "char" | "missing"
  ) => void;
  originalData: NormalizedData;
  testData: NormalizedData;
  diffs: DiffResult[];
}

function ResultPanel({
  data,
  panel,
  isCollapsed,
  isEditMode,
  fontSize,
  fontFamily,
  originalFontFamily,
  originalFontWeight,
  testFontFamily,
  testFontWeight,
  selectedToken,
  onCharClick,
  originalData,
  testData,
  diffs,
}: ResultPanelProps) {
  const resultFontSize = {
    small: "16px",
    medium: "18px",
    large: "20px",
  }[fontSize];

  const panelTypography =
    panel === "original"
      ? {
          fontFamily: originalFontFamily ?? fontFamily,
          fontWeight: originalFontWeight,
        }
      : {
          fontFamily: testFontFamily ?? fontFamily,
          fontWeight: testFontWeight,
        };

  if (isCollapsed && panel === "original") {
    return null;
  }

  const panelClassName =
    panel === "checked"
      ? "rounded-3xl p-4 leading-relaxed overflow-auto whitespace-pre-wrap wrap-break-word transition-all duration-300 bg-slate-950/95 text-slate-100 shadow-lg shadow-slate-950/30"
      : "rounded-3xl p-4 leading-relaxed overflow-auto whitespace-pre-wrap wrap-break-word transition-all duration-300 border border-slate-800 bg-slate-950/95 text-slate-100 shadow-lg shadow-slate-950/30";

  const nodes: React.ReactNode[] = [];
  let originalIndex = 0;
  let testIndex = 0;
  let originalRawPos = 0;
  let testRawPos = 0;

  const renderToken = (
    char: string,
    className: string | undefined,
    position: number,
    tokenType: "char" | "missing" = "char"
  ) => {
    const keyIndex = nodes.length;
    const keyPrefix = `${panel}-${tokenType}-${position}-${keyIndex}`;

    if (char === "\n") {
      return <br key={keyPrefix} />;
    }

    const isSelected =
      selectedToken?.panel === panel &&
      selectedToken.position === position &&
      selectedToken.type === tokenType;
    const isClickable = isEditMode && Boolean(onCharClick);

    return (
      <span
        key={keyPrefix}
        className={cn(
          "transition-all duration-200",
          className,
          isSelected && "bg-yellow-300/40 text-slate-950",
          isClickable &&
            "cursor-pointer hover:scale-110 hover:bg-yellow-300/40 dark:hover:bg-yellow-400/30 px-0.5 rounded"
        )}
        onMouseDown={
          isClickable
            ? (event) => {
                event.preventDefault();
              }
            : undefined
        }
        onClick={isClickable ? () => onCharClick?.(panel, position, tokenType) : undefined}
        data-position={position}
        data-panel={panel}
        role={isClickable ? "button" : undefined}
      >
        {char}
      </span>
    );
  };

  const flushRawLeft = (targetRawIndex: number) => {
    while (originalRawPos < targetRawIndex) {
      nodes.push(renderToken(originalData.raw[originalRawPos], undefined, originalRawPos));
      originalRawPos++;
    }
  };

  const flushRawRight = (targetRawIndex: number) => {
    while (testRawPos < targetRawIndex) {
      nodes.push(renderToken(testData.raw[testRawPos], undefined, testRawPos));
      testRawPos++;
    }
  };

  if (originalData.normalized === testData.normalized) {
    for (let i = 0; i < data.raw.length; i++) {
      nodes.push(renderToken(data.raw[i], undefined, i));
    }

    return (
      <div className={panelClassName} style={{ ...panelTypography, fontSize: resultFontSize }}>
        {nodes}
      </div>
    );
  }

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
        nodes.push(
          renderToken(
            testData.raw[testPos],
            "bg-red-500/20 text-red-100 border border-red-400/30 px-1 rounded transition-all hover:bg-red-500/25 hover:text-red-200",
            testPos
          )
        );
        testRawPos = testPos + 1;
      }

      testIndex++;
      return;
    }

    if (d.type === "missing") {
      const originalPos = originalData.map[originalIndex];

      if (panel === "original" && originalPos !== undefined && originalPos >= originalRawPos) {
        flushRawLeft(originalPos);
        nodes.push(
          renderToken(
            originalData.raw[originalPos],
            "bg-red-500/20 text-red-100 border border-red-400/30 px-1 rounded transition-all hover:bg-red-500/25 hover:text-red-200",
            originalPos
          )
        );
        originalRawPos = originalPos + 1;
      }

      if (panel === "checked" && originalPos !== undefined) {
        const missingChar = originalData.raw[originalPos];
        const displayChar = missingChar === "\n" ? "↵" : missingChar;
        nodes.push(
          renderToken(
            displayChar,
            "bg-blue-500/20 text-blue-100 border border-blue-400 px-1 rounded",
            originalPos,
            "missing"
          )
        );
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
          nodes.push(
            renderToken(
              originalData.raw[originalPos],
              "bg-red-500/20 text-red-100 border border-red-400/30 px-1 rounded transition-all hover:bg-red-500/25 hover:text-red-200",
              originalPos
            )
          );
          originalRawPos = originalPos + 1;
        }

        if (panel === "checked" && testPos >= testRawPos) {
          flushRawRight(testPos);
          nodes.push(
            renderToken(
              testData.raw[testPos],
              "bg-red-500/20 text-red-100 border border-red-400/30 px-1 rounded transition-all hover:bg-red-500/25 hover:text-red-200",
              testPos
            )
          );
          testRawPos = testPos + 1;
        }
      }

      originalIndex++;
      testIndex++;
      return;
    }
  });

  if (panel === "original") {
    flushRawLeft(originalData.raw.length);
  }

  if (panel === "checked") {
    flushRawRight(testData.raw.length);
  }

  return (
    <div className={panelClassName} style={{ ...panelTypography, fontSize: resultFontSize }}>
      {nodes}
    </div>
  );
}

export function ResultDisplay({
  originalData,
  testData,
  diffs,
  isCollapsed,
  isEditMode,
  fontSize = "medium",
  fontFamily,
  originalFontFamily,
  originalFontWeight,
  testFontFamily,
  testFontWeight,
  selectedToken,
  onCharClick,
}: ResultDisplayProps) {
  return (
    <div className={cn("grid gap-6 mt-4 ", isCollapsed ? "grid-cols-1" : "grid-cols-2", "w-full")}>
      {!isCollapsed && (
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              "text-sm font-semibold flex items-center gap-2",
              "text-slate-300 dark:text-slate-400"
            )}
          >
            <span className="text-lg">📄</span>
            Bản gốc
          </div>
          <ResultPanel
            data={originalData}
            panel="original"
            isCollapsed={isCollapsed}
            isEditMode={isEditMode}
            fontSize={fontSize}
            fontFamily={fontFamily}
            originalFontFamily={originalFontFamily}
            originalFontWeight={originalFontWeight}
            testFontFamily={testFontFamily}
            testFontWeight={testFontWeight}
            selectedToken={selectedToken}
            onCharClick={onCharClick}
            originalData={originalData}
            testData={testData}
            diffs={diffs}
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div
          className={cn(
            "text-sm font-semibold flex items-center gap-2",
            "text-slate-300 dark:text-slate-400"
          )}
        >
          <span className="text-lg">🔎</span>
          Bản kiểm tra
        </div>
        <ResultPanel
          data={testData}
          panel="checked"
          isCollapsed={isCollapsed}
          isEditMode={isEditMode}
          fontSize={fontSize}
          fontFamily={fontFamily}
          originalFontFamily={originalFontFamily}
          originalFontWeight={originalFontWeight}
          testFontFamily={testFontFamily}
          testFontWeight={testFontWeight}
          selectedToken={selectedToken}
          onCharClick={onCharClick}
          originalData={originalData}
          testData={testData}
          diffs={diffs}
        />
      </div>
    </div>
  );
}
