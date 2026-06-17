"use client";
import React from "react";
import type { CalcResult } from "../utils/calculateOptimalBreaks";
import { cn } from "@/lib/utils";

type Props = {
  result: CalcResult | null;
  boxWidth: number;
  isDark: boolean;
};

export default function AlignInstructions({ result, boxWidth, isDark }: Props) {
  if (!result)
    return (
      <div
        className={cn(
          "p-4 text-sm rounded-3xl",
          isDark ? "bg-slate-900 text-slate-300" : "bg-slate-50 text-slate-600"
        )}
      >
        Tạo bố cục để xem hướng dẫn canh dòng.
      </div>
    );

  return (
    <div
      className={cn(
        "p-4 rounded-3xl text-sm transition-colors duration-300",
        isDark
          ? "bg-slate-950 border border-slate-700 text-slate-200"
          : "bg-slate-50 border border-slate-200 text-slate-800"
      )}
    >
      <div className={cn("mb-2 font-semibold", isDark ? "text-slate-100" : "text-slate-900")}>
        Hướng dẫn canh dòng (dành cho kỹ thuật)
      </div>
      <div className={cn("mb-3 text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
        Cung cấp thông tin khoảng trống thừa mỗi dòng và chiến lược phân phối đơn giản.
      </div>

      <pre
        className={cn(
          "rounded p-3 text-xs overflow-auto",
          isDark ? "bg-slate-900 text-slate-100" : "bg-slate-100 text-slate-800"
        )}
      >
        {JSON.stringify(
          result.lines.map((ln, idx) => {
            const w = result.lineWidths[idx] ?? 0;
            const extra = Math.max(0, boxWidth - w);
            const tokens = result.perLineTokens?.[idx] ?? [ln];
            const gaps = Math.max(0, tokens.length - 1);
            const perGap = gaps > 0 ? +(extra / gaps).toFixed(2) : null;
            return {
              line: idx + 1,
              text: ln,
              width: w,
              extraSpace: extra,
              tokens,
              gaps,
              perGap,
              strategy: gaps > 0 ? "distribute-per-gap" : "left-pad-or-center",
            };
          }),
          null,
          2
        )}
      </pre>

      <div className="mt-3">
        <div className="font-semibold">Ghi chú</div>
        <ul className="list-disc ml-5 text-xs">
          <li>
            Sử dụng <code>perGap</code> để thêm khoảng cách giữa các token khi cần căn đều
            (justification).
          </li>
          <li>
            Nếu <code>perGap</code> là null thì cân nhắc căn giữa dòng hoặc thêm padding trái.
          </li>
          <li>
            Tách token sử dụng <code>Intl.Segmenter</code> khi trình duyệt hỗ trợ; <code>gaps</code>{" "}
            tương ứng với ranh giới token.
          </li>
        </ul>
      </div>
    </div>
  );
}
