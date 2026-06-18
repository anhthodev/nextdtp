"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import AutoLayoutForm, { FormValues } from "../../src/components/AutoLayoutForm";
import PreviewBox from "../../src/components/PreviewBox";
import AlignInstructions from "../../src/components/AlignInstructions";
import calculateOptimalBreaks, { CalcResult } from "../../src/utils/calculateOptimalBreaks";
import { cn } from "../../src/lib/utils";

export default function Page() {
  const singleFontFamily = "A-OTF Gothic MB101 Pro";
  const [values, setValues] = useState<FormValues | null>(null);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [tab, setTab] = useState<"check" | "align">("check");
  const [isDark, setIsDark] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    window.setTimeout(() => {
      setIsDark(localStorage.getItem("theme") === "dark");
    }, 0);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleGenerate = async (v: FormValues) => {
    setValues(v);
    // run calculation on client
    try {
      const isLineCheckMode = v.layoutMode === "line-check";
      const res = await calculateOptimalBreaks(v.text, {
        layoutMode: v.layoutMode,
        checkOnly: v.layoutMode === "line-check",
        width: isLineCheckMode ? 600 : v.width,
        height: isLineCheckMode ? 400 : v.height,
        fontFamily: v.fontFamily,
        fontSizePt: v.fontSizePt,
        space: isLineCheckMode ? 0 : v.space,
        targetLines: isLineCheckMode ? 4 : v.targetLines,
        lineHeight: isLineCheckMode ? 1.4 : v.lineHeight,
        preservePhrases: true,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
      setResult(null);
    }
  };

  return (
    <main
      className={cn(
        "min-h-screen pb-24 transition-colors duration-300",
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      )}
    >
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-30 border-b backdrop-blur-xl bg-white/90 text-slate-900 shadow-sm backdrop-saturate-150",
          isDark
            ? "bg-slate-950/95 border-slate-800 text-slate-100"
            : "bg-white/95 border-slate-200 text-slate-900"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🧩</div>
            <div>
              <h1 className="text-lg font-semibold">Canh dòng</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Giữ bố cục và màu nền khi chuyển trang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/check"
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Trang chủ
            </Link>
            <button
              onClick={() => setIsDark(!isDark)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
                isDark
                  ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              )}
              title="Chuyển đổi chế độ sáng/tối"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside
            className={cn(
              "relative w-full overflow-hidden rounded-md border bg-white/90 shadow-sm transition-all duration-300 lg:flex-none",
              isSidebarCollapsed ? "lg:w-14" : "lg:w-96",
              isDark ? "border-slate-800 bg-slate-950/95" : "border-slate-200 bg-white"
            )}
          >
            <AutoLayoutForm
              isDark={isDark}
              initial={{}}
              collapsed={isSidebarCollapsed}
              onToggleCollapseAction={() => setIsSidebarCollapsed((value) => !value)}
              onGenerateAction={handleGenerate}
            />
          </aside>

          <section
            className={cn(
              "min-w-0 flex-1 rounded-md border shadow-sm transition-all duration-300",
              isDark ? "border-slate-800 bg-slate-950/95" : "border-slate-200 bg-white"
            )}
          >
            <div
              className={cn(
                "flex border-b px-4 py-3",
                isDark ? "border-slate-800" : "border-slate-200"
              )}
            >
              <button
                className={cn(
                  "px-4 py-2 font-medium transition-colors duration-200",
                  tab === "check"
                    ? isDark
                      ? "border-b-2 border-slate-100 text-slate-100"
                      : "border-b-2 border-slate-900 text-slate-900"
                    : isDark
                      ? "text-slate-400 hover:text-slate-100"
                      : "text-slate-500 hover:text-slate-900"
                )}
                onClick={() => setTab("check")}
              >
                Kiểm tra
              </button>
              <button
                className={cn(
                  "px-4 py-2 font-medium transition-colors duration-200",
                  tab === "align"
                    ? isDark
                      ? "border-b-2 border-slate-100 text-slate-100"
                      : "border-b-2 border-slate-900 text-slate-900"
                    : isDark
                      ? "text-slate-400 hover:text-slate-100"
                      : "text-slate-500 hover:text-slate-900"
                )}
                onClick={() => setTab("align")}
              >
                Canh dòng (kỹ thuật)
              </button>
            </div>

            {tab === "check" ? (
              <PreviewBox
                result={result}
                width={values?.width ?? 600}
                stretch={isSidebarCollapsed}
                height={values?.height ?? 400}
                fontFamily={values?.fontFamily ?? singleFontFamily}
                fontSizePt={values?.fontSizePt ?? 12}
                lineHeight={values?.lineHeight ?? 1.4}
                align={values?.align ?? "left"}
                isDark={isDark}
                layoutMode={values?.layoutMode ?? "technical"}
              />
            ) : (
              <AlignInstructions result={result} boxWidth={values?.width ?? 600} isDark={isDark} />
            )}
          </section>
        </div>
      </div>

       <footer
                className={cn(
                  "mt-12 text-center text-sm pb-6 transition-colors duration-300",
                  isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-600"
                )}
              >
                <p>
                  Made by{" "}
                  <span className="font-semibold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    anhthodev
                  </span>{" "}
                  🚀
                </p>
      
                <div className="mt-2 space-y-1">
                  <p>📞 Zalo: 0703162730</p>
                  <p>💼 Nhận thiết kế website, web app và công cụ tự động hóa</p>
                  <p>📩 Liên hệ để trao đổi yêu cầu và báo giá</p>
                </div>
              </footer>
    </main>
  );
}
