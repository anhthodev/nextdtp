"use client";
import React from "react";
import type { CalcResult } from "../utils/calculateOptimalBreaks";
import { cn } from "@/lib/utils";

type Props = {
  result: CalcResult | null;
  width: number;
  stretch?: boolean;
  height: number;
  fontFamily: string;
  fontSizePt: number;
  lineHeight: number;
  align: "left" | "center" | "right";
  isDark: boolean;
  layoutMode?: "technical" | "line-check";
};

export default function PreviewBox({
  result,
  width,
  stretch = false,
  height,
  fontFamily,
  fontSizePt,
  lineHeight,
  align,
  isDark,
  layoutMode = "technical",
}: Props) {
  const highlightCount = result?.perLineHighlightTokens?.flat().filter(Boolean).length ?? 0;
  const highlightClass = (kind: "up" | "down" | null | undefined) => {
    if (kind === "up") {
      return "rounded bg-yellow-400/25 px-0.5 text-yellow-600 ring-1 ring-yellow-400/40";
    }

    if (kind === "down") {
      return "rounded bg-emerald-500/20 px-0.5 text-emerald-600 ring-1 ring-emerald-400/40";
    }

    return "rounded bg-slate-500/10 px-0.5 text-slate-500 ring-1 ring-slate-400/20";
  };

  return (
    <div
      className={cn(
        "p-4 rounded-3xl transition-colors duration-300",
        isDark ? "bg-slate-950/95 border border-slate-800" : "bg-slate-50 border border-slate-200"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={cn("text-sm font-semibold", isDark ? "text-slate-100" : "text-slate-700")}>
          Xem trước
        </div>
        {result && (
          <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
            {layoutMode === "line-check" ? (
              <>
                Highlight: {highlightCount} • {result.totalLines} dòng
              </>
            ) : (
              <>
                Dòng: {result.totalLines} •{" "}
                {result.overflow ? (
                  <span className="text-rose-400">Tràn</span>
                ) : (
                  <span className="text-emerald-400">OK</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          "mx-auto resize-both overflow-auto rounded-3xl border shadow-lg",
          isDark
            ? "border-slate-700 bg-slate-900/95 shadow-slate-950/30"
            : "border-slate-200 bg-slate-100 shadow-slate-200/40"
        )}
        style={{
          width: stretch ? "100%" : `${width}px`,
          maxWidth: stretch ? "none" : `${width}px`,
          height: `${height}px`,
          minWidth: 200,
          minHeight: 150,
        }}
      >
        <div
          className={cn(
            "p-4 h-full w-full box-border text-sm leading-5",
            isDark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
          )}
          style={{
            fontFamily,
            fontSize: `${fontSizePt}pt`,
            textAlign: align as any,
            lineHeight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
          }}
        >
          {result ? (
            layoutMode === "line-check" ? (
              <div className="flex flex-col gap-2 whitespace-pre-wrap leading-6">
                {result.lines.map((ln, idx) => {
                  const highlightLine =
                    result.perLineHighlightTokens?.[idx]?.some(Boolean) ?? false;
                  const tokens = result.perLineTokens?.[idx] ?? [ln];

                  return (
                    <div key={idx} className="flex flex-col items-start gap-1">
                      <span
                        className={cn(
                          "inline-flex items-baseline gap-0.5 rounded-md px-1 py-0.5",
                          highlightLine && "bg-slate-500/10 ring-1 ring-slate-400/20"
                        )}
                      >
                        {tokens.map((token, tokenIndex) => {
                          const kind = result.perLineHighlightKinds?.[idx]?.[tokenIndex] ?? null;
                          const highlight =
                            result.perLineHighlightTokens?.[idx]?.[tokenIndex] ?? false;

                          return (
                            <span
                              key={`${idx}-${tokenIndex}`}
                              className={cn(highlight && highlightClass(kind))}
                            >
                              {token}
                            </span>
                          );
                        })}
                      </span>
                      {idx < result.lines.length - 1 && (
                        <span className="ml-1 text-xs font-medium text-slate-400">↓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              result.lines.map((ln, idx) =>
                (() => {
                  const highlightLine =
                    result.perLineHighlightTokens?.[idx]?.some(Boolean) ?? false;

                  return (
                    <div
                      key={idx}
                      style={{ width: "100%", paddingLeft: result.perLineIndents?.[idx] ?? 0 }}
                      className={cn(
                        "whitespace-pre-wrap",
                        highlightLine &&
                          "rounded-md bg-red-500/10 px-1 py-0.5 ring-1 ring-red-400/20"
                      )}
                    >
                      {(result.perLineTokens?.[idx] ?? [ln]).map((token, tokenIndex) => {
                        const highlight =
                          result.perLineHighlightTokens?.[idx]?.[tokenIndex] ?? false;

                        return (
                          <span
                            key={`${idx}-${tokenIndex}`}
                            className={cn(
                              highlight &&
                                "rounded bg-red-500/20 px-0.5 text-red-500 ring-1 ring-red-400/40"
                            )}
                          >
                            {token}
                          </span>
                        );
                      })}
                    </div>
                  );
                })()
              )
            )
          ) : (
            <div className="text-sm text-slate-500">Chưa tạo bố cục.</div>
          )}
        </div>
      </div>
    </div>
  );
}
