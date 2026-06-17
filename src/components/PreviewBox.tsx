"use client";
import React from "react";
import type { CalcResult } from "../utils/calculateOptimalBreaks";
import { cn } from "@/lib/utils";

type Props = {
  result: CalcResult | null;
  width: number;
  height: number;
  fontFamily: string;
  fontSizePt: number;
  lineHeight: number;
  align: "left" | "center" | "right";
  isDark: boolean;
};

export default function PreviewBox({
  result,
  width,
  height,
  fontFamily,
  fontSizePt,
  lineHeight,
  align,
  isDark,
}: Props) {
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
            Dòng: {result.totalLines} •{" "}
            {result.overflow ? (
              <span className="text-rose-400">Tràn</span>
            ) : (
              <span className="text-emerald-400">OK</span>
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
          width: `${width}px`,
          height: `${height}px`,
          minWidth: 200,
          minHeight: 150,
        }}
      >
        <div
          className={cn(
            "p-4 h-full w-full box-border",
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
            result.lines.map((ln, idx) => (
              <div
                key={idx}
                style={{ width: "100%", paddingLeft: result.perLineIndents?.[idx] ?? 0 }}
                className="whitespace-pre-wrap leading-7"
              >
                {ln}
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">Chưa tạo bố cục.</div>
          )}
        </div>
      </div>
    </div>
  );
}
