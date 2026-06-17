"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCompare } from "@/hooks/useCompare";
import { useHydration } from "@/hooks/useHydration";
import { Header } from "@/components/Header";
import { ResultDisplay } from "@/components/ResultDisplay";
import Fireworks from "@/components/Fireworks";

const tutorialStorageKey = "dtpcompare.tutorial.completed";

const tutorialSteps = [
  {
    title: "Chào mừng",
    description:
      "Trang này sẽ hướng dẫn bạn từng bước trước khi dùng lần đầu. Hoàn thành xong thì lần sau sẽ không hiện lại.",
    target: "header",
  },
  {
    title: "Bước 1: Văn bản gốc",
    description:
      "Nhập nội dung gốc ở khung bên trái. Đây là bản để hệ thống so sánh và phát hiện khác biệt.",
    target: "source",
  },
  {
    title: "Bước 2: Văn bản kiểm tra",
    description:
      "Nhập nội dung cần kiểm tra ở khung bên phải. Khi bạn gõ, kết quả sẽ tự cập nhật ngay.",
    target: "target",
  },
  {
    title: "Bước 3: Cách hiển thị",
    description:
      "Dùng thanh công cụ để đổi cỡ chữ, đổi bố cục 1/2 cột, chuyển sáng/tối và mở hướng dẫn lại khi cần.",
    target: "controls",
  },
  {
    title: "Bước 4: Đọc kết quả",
    description:
      "Khung kết quả bên dưới sẽ tô màu phần sai, thiếu, hoặc thay thế. Bạn có thể bật chế độ chỉnh sửa để chọn ký tự trực tiếp.",
    target: "result",
  },
];

export function DTPCompare() {
  const isHydrated = useHydration();
  const japaneseUIFontFamily =
    '"Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "YuGothic", Meiryo, "Noto Sans JP", sans-serif';

  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [heightCollapsed, setHeightCollapsed] = useState(false);
  const [isSingleLayout, setIsSingleLayout] = useState(false);
  const [selectedToken, setSelectedToken] = useState<{
    panel: "original" | "checked";
    position: number;
    type: "char" | "missing";
  } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const targetRef = useRef<HTMLTextAreaElement>(null);

  const { originalData, testData, diffs, hasError } = useCompare(sourceText, targetText);

  const [showFireworks, setShowFireworks] = useState(false);
  const prevHasError = useRef(hasError);

  useEffect(() => {
    // trigger fireworks only when state transitions from error -> no-error
    if (prevHasError.current && !hasError) {
      setShowFireworks(true);
      const t = setTimeout(() => setShowFireworks(false), 3500);
      return () => clearTimeout(t);
    }
    prevHasError.current = hasError;
  }, [hasError]);

  useEffect(() => {
    if (!isHydrated) return;

    const hasCompletedTutorial = localStorage.getItem(tutorialStorageKey) === "true";
    if (!hasCompletedTutorial) {
      window.setTimeout(() => {
        setTutorialStep(0);
        setShowTutorial(true);
      }, 0);
    }
  }, [isHydrated]);

  // Load from localStorage only after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const savedSource = localStorage.getItem("sourceText") || "";
    const savedTarget = localStorage.getItem("targetText") || "";
    const savedDark = localStorage.getItem("theme") === "dark" ? true : false;
    const savedFontSize = (localStorage.getItem("fontSize") || "medium") as
      | "small"
      | "medium"
      | "large";
    const savedEditMode = localStorage.getItem("editMode") === "true";
    const savedCollapsed = localStorage.getItem("resultCollapsed") === "true";
    const savedHeightCollapsed = localStorage.getItem("heightCollapsed") === "true";
    const savedSingleLayout = localStorage.getItem("singleLayout") === "true";

    window.setTimeout(() => {
      setSourceText(savedSource);
      setTargetText(savedTarget);
      setIsDark(savedDark);
      setFontSize(savedFontSize);
      setIsEditMode(savedEditMode);
      setIsCollapsed(savedCollapsed);
      setHeightCollapsed(savedHeightCollapsed);
      setIsSingleLayout(savedSingleLayout);
    }, 0);
  }, [isHydrated]);

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSourceText(value);
    localStorage.setItem("sourceText", value);
  }, []);

  const handleTargetChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTargetText(value);
    localStorage.setItem("targetText", value);
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  }, [isDark]);

  const handleFontSizeChange = useCallback((size: "small" | "medium" | "large") => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
  }, []);

  const handleEditModeToggle = useCallback(() => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);
    localStorage.setItem("editMode", newMode ? "true" : "false");
  }, [isEditMode]);

  const handleCollapsedToggle = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem("resultCollapsed", newCollapsed ? "true" : "false");
  }, [isCollapsed]);

  const handleHeightToggle = useCallback(() => {
    const newHeight = !heightCollapsed;
    setHeightCollapsed(newHeight);
    localStorage.setItem("heightCollapsed", newHeight ? "true" : "false");
  }, [heightCollapsed]);

  const handleLayoutToggle = useCallback(() => {
    const newLayout = !isSingleLayout;
    setIsSingleLayout(newLayout);
    localStorage.setItem("singleLayout", newLayout ? "true" : "false");
  }, [isSingleLayout]);

  const handleCharClick = useCallback(
    (panel: "original" | "checked", position: number, type: "char" | "missing" = "char") => {
      const textarea = panel === "original" ? sourceRef.current : targetRef.current;
      setSelectedToken({ panel, position, type });

      if (textarea) {
        textarea.focus();
        const maxPosition = textarea.value.length;
        const start = Math.min(position, maxPosition);
        const end = Math.min(position + 1, maxPosition);
        textarea.setSelectionRange(start, end);

        const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
        const lines = textarea.value.substring(0, start).split("\n").length - 1;
        textarea.scrollTop = lines * lineHeight - textarea.clientHeight / 2;
      }
    },
    []
  );

  const handleTextareaBlur = useCallback(() => {
    setSelectedToken(null);
  }, []);

  const handleTutorialClose = useCallback(() => {
    localStorage.setItem(tutorialStorageKey, "true");
    setShowTutorial(false);
  }, []);

  const handleTutorialNext = useCallback(() => {
    setTutorialStep((currentStep) => {
      const nextStep = Math.min(currentStep + 1, tutorialSteps.length - 1);
      if (nextStep === currentStep) {
        localStorage.setItem(tutorialStorageKey, "true");
        setShowTutorial(false);
      }
      return nextStep;
    });
  }, []);

  const handleTutorialBack = useCallback(() => {
    setTutorialStep((currentStep) => Math.max(currentStep - 1, 0));
  }, []);

  const fontSizeVars = {
    small: { "--font-size-base": "14px", "--font-size-result": "16px" } as React.CSSProperties,
    medium: { "--font-size-base": "16px", "--font-size-result": "18px" } as React.CSSProperties,
    large: { "--font-size-base": "18px", "--font-size-result": "20px" } as React.CSSProperties,
  };

  const minHeight = heightCollapsed ? "100px" : "350px";
  const currentTutorial = tutorialSteps[tutorialStep];

  // Prevent hydration mismatch by not rendering until after hydration
  if (!isHydrated) {
    return (
      <div
        className={cn(
          "min-h-screen transition-colors duration-200",
          "dark bg-slate-950 text-slate-100"
        )}
        style={fontSizeVars["medium"]}
      >
        <div className="max-w-7xl mx-auto px-4 py-6" suppressHydrationWarning>
          {/* Placeholder content - minimal to avoid hydration mismatch */}
          <div className="h-screen" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-all duration-300",
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      )}
      style={fontSizeVars[fontSize]}
    >
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div
            className={cn(
              "w-full max-w-2xl rounded-3xl border p-6 shadow-2xl",
              isDark
                ? "border-slate-800 bg-slate-950 text-slate-100 shadow-slate-950/60"
                : "border-slate-200 bg-white text-slate-900 shadow-slate-300/50"
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  Hướng dẫn bắt buộc cho lần đầu
                </p>
                <h2 className="text-2xl font-bold">{currentTutorial.title}</h2>
              </div>
              <div
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                )}
              >
                {tutorialStep + 1}/{tutorialSteps.length}
              </div>
            </div>

            <div
              className={cn(
                "mb-5 rounded-2xl border p-4 text-sm leading-6",
                isDark
                  ? "border-slate-800 bg-slate-900 text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              )}
            >
              {currentTutorial.description}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className={cn(
                  "rounded-2xl border p-4",
                  currentTutorial.target === "source"
                    ? isDark
                      ? "border-sky-500/60 bg-sky-500/10"
                      : "border-sky-400 bg-sky-50"
                    : isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Khung trái
                </p>
                <p className="mt-1 text-sm">Văn bản gốc để so sánh.</p>
              </div>
              <div
                className={cn(
                  "rounded-2xl border p-4",
                  currentTutorial.target === "target"
                    ? isDark
                      ? "border-sky-500/60 bg-sky-500/10"
                      : "border-sky-400 bg-sky-50"
                    : isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                )}
              >
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                  Khung phải
                </p>
                <p className="mt-1 text-sm">Văn bản cần kiểm tra.</p>
              </div>
            </div>

            {currentTutorial.target === "controls" && (
              <div
                className={cn(
                  "mt-4 rounded-2xl border p-4 text-sm",
                  isDark
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-100"
                    : "border-amber-300 bg-amber-50 text-amber-900"
                )}
              >
                Dùng các nút phía trên để đổi cỡ chữ, đổi bố cục, chuyển sáng/tối và mở hướng dẫn
                lại khi cần.
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleTutorialBack}
                disabled={tutorialStep === 0}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                  tutorialStep === 0
                    ? "cursor-not-allowed opacity-40"
                    : isDark
                      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                Quay lại
              </button>

              <button
                type="button"
                onClick={
                  currentTutorial.target === "result" ? handleTutorialClose : handleTutorialNext
                }
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                  isDark
                    ? "bg-sky-500 text-slate-950 hover:bg-sky-400"
                    : "bg-sky-600 text-white hover:bg-sky-500"
                )}
              >
                {currentTutorial.target === "result" ? "Bắt đầu sử dụng" : "Tiếp theo"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8",
          showTutorial && "pointer-events-none select-none"
        )}
      >
        <Header
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          onLayoutToggle={handleLayoutToggle}
        />

        {/* Editors */}
        <div className={cn("grid gap-6 mb-6", isSingleLayout ? "grid-cols-1" : "grid-cols-2")}>
          <div
            className={cn(
              "p-5 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
              currentTutorial?.target === "source" &&
                (isDark
                  ? "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-950"
                  : "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-50"),
              isDark
                ? "bg-[#1a1f3a]/80 border border-[#27306d] hover:border-[#3b82f6]/50 shadow-smooth-dark"
                : "bg-white/80 border border-slate-200 hover:border-blue-300 shadow-smooth"
            )}
          >
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">📄</span>
              <span>Văn Bản Gốc</span>
            </h2>
            <textarea
              ref={sourceRef}
              value={sourceText}
              onChange={handleSourceChange}
              onBlur={handleTextareaBlur}
              placeholder="Nhập văn bản gốc..."
              className={cn(
                "w-full p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                isDark
                  ? "bg-[#0f1535] text-slate-100 border-[#27306d] placeholder-slate-500"
                  : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400"
              )}
              style={{ height: minHeight, minHeight, fontFamily: japaneseUIFontFamily }}
            />
          </div>

          <div
            className={cn(
              "p-5 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
              currentTutorial?.target === "target" &&
                (isDark
                  ? "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-950"
                  : "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-50"),
              isDark
                ? "bg-[#1a1f3a]/80 border border-[#27306d] hover:border-[#3b82f6]/50 shadow-smooth-dark"
                : "bg-white/80 border border-slate-200 hover:border-blue-300 shadow-smooth"
            )}
          >
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">✏️</span>
              <span>Văn Bản Kiểm Tra</span>
            </h2>
            <textarea
              ref={targetRef}
              value={targetText}
              onChange={handleTargetChange}
              onBlur={handleTextareaBlur}
              placeholder="Nhập văn bản cần so sánh..."
              className={cn(
                "w-full p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                isDark
                  ? "bg-[#0f1535] text-slate-100 border-[#27306d] placeholder-slate-500"
                  : "bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400"
              )}
              style={{ height: minHeight, minHeight, fontFamily: japaneseUIFontFamily }}
            />
          </div>
        </div>

        {/* Height Toggle & Status */}
        <div
          className={cn(
            "flex justify-center mb-6 rounded-2xl",
            currentTutorial?.target === "controls" &&
              (isDark
                ? "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-950"
                : "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-50")
          )}
        >
          <button
            onClick={handleHeightToggle}
            className={cn(
              "px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95",
              isDark
                ? "bg-linear-to-r from-blue-600 to-blue-700 hover:shadow-glow-blue text-white"
                : "bg-linear-to-r from-blue-500 to-blue-600 hover:shadow-smooth text-white"
            )}
            title="Thu gọn/mở rộng chiều cao input"
          >
            {heightCollapsed ? "⬇️ Mở rộng" : "⬆️ Thu gọn"}
          </button>
        </div>

        {/* Result Panel */}
        <div
          className={cn(
            "relative rounded-3xl",
            currentTutorial?.target === "result" &&
              (isDark
                ? "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-950"
                : "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-50")
          )}
        >
          <Fireworks active={showFireworks} duration={1400} />
          <div
            className={cn(
              "relative overflow-hidden p-6 rounded-2xl backdrop-blur-sm transition-all duration-300",
              isDark
                ? "bg-[#1a1f2b]/95 border border-[#27306d] shadow-smooth-dark"
                : "bg-white/80 border border-slate-200 shadow-smooth"
            )}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">📌 Kết Quả</h2>
                <div
                  className={cn(
                    "w-3 h-3 rounded-full animate-pulse-soft",
                    hasError
                      ? "bg-linear-to-r from-red-500 to-red-600 shadow-glow-blue"
                      : "bg-linear-to-r from-green-500 to-emerald-600"
                  )}
                />
                <span className="text-sm font-medium">
                  {hasError ? "Phát hiện lỗi" : "Không có lỗi"}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCollapsedToggle}
                  className={cn(
                    "px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95",
                    isDark
                      ? "bg-[#27306d] hover:bg-[#3b82f6]/30 text-slate-300"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  )}
                  title="Ẩn/hiện bản gốc"
                >
                  {isCollapsed ? "⬅️" : "➡️"}
                </button>

                <button
                  onClick={handleEditModeToggle}
                  className={cn(
                    "px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 font-medium",
                    isEditMode
                      ? isDark
                        ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-glow-blue"
                        : "bg-linear-to-r from-blue-500 to-blue-600 text-white"
                      : isDark
                        ? "bg-[#27306d] text-slate-400 opacity-50"
                        : "bg-slate-300 text-slate-600 opacity-50"
                  )}
                  title="Bật/tắt chế độ chỉnh sửa"
                >
                  🖊️ Chỉnh sửa
                </button>
              </div>
            </div>
          </div>

          <ResultDisplay
            originalData={originalData}
            testData={testData}
            diffs={diffs}
            isCollapsed={isCollapsed}
            isEditMode={isEditMode}
            selectedToken={selectedToken}
            onCharClick={handleCharClick}
            fontFamily={japaneseUIFontFamily}
          />
        </div>

        {/* Footer */}
        <footer
          className={cn(
            "mt-12 text-center text-sm pb-6 transition-colors duration-300",
            isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-600"
          )}
        >
          Made by{" "}
          <span className="font-semibold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            anhthodev
          </span>{" "}
          🚀
        </footer>
      </div>
    </div>
  );
}
