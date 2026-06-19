"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCompare } from "@/hooks/useCompare";
import { useHydration } from "@/hooks/useHydration";
import { useLiteMode } from "@/hooks/useLiteMode";
import { Header } from "@/components/Header";
import { ResultDisplay } from "@/components/ResultDisplay";

const tutorialStorageKey = "dtpcompare.tutorial.completed";

const vietnameseUIFontFamily =
  'var(--font-be-vietnam-pro), "Be Vietnam Pro", "Inter", "Segoe UI", system-ui, sans-serif';
const japaneseUIFontFamily =
  'var(--font-noto-sans-jp), "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "YuGothic", Meiryo, system-ui, sans-serif';

function isJapaneseScriptCharacter(char: string) {
  const codePoint = char.codePointAt(0);

  if (codePoint === undefined) {
    return false;
  }

  return (
    (codePoint >= 0x3040 && codePoint <= 0x309f) ||
    (codePoint >= 0x30a0 && codePoint <= 0x30ff) ||
    (codePoint >= 0x31f0 && codePoint <= 0x31ff) ||
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) ||
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff)
  );
}

function getStoredValue(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredValue(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage failures in restricted Safari modes
  }
}

function getTypographyForText(text: string) {
  const usesJapanese = Array.from(text).some(isJapaneseScriptCharacter);

  return {
    fontFamily: usesJapanese ? japaneseUIFontFamily : vietnameseUIFontFamily,
    fontWeight: usesJapanese ? 500 : 400,
  };
}

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
  const isLiteMode = useLiteMode();

  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [heightCollapsed, setHeightCollapsed] = useState(false);
  const [isInputWidthExpanded, setIsInputWidthExpanded] = useState(false);
  const [isSingleLayout, setIsSingleLayout] = useState(false);
  const [selectedToken, setSelectedToken] = useState<{
    panel: "original" | "checked";
    position: number;
    type: "char" | "missing";
  } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showJumpToInputs, setShowJumpToInputs] = useState(false);

  const inputSectionRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const targetRef = useRef<HTMLTextAreaElement>(null);

  const { originalData, testData, diffs, hasError } = useCompare(sourceText, targetText);

  useEffect(() => {
    if (!isHydrated) return;

    const hasCompletedTutorial = getStoredValue(tutorialStorageKey) === "true";
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

    const savedSource = getStoredValue("sourceText") || "";
    const savedTarget = getStoredValue("targetText") || "";
    const savedDark = getStoredValue("theme") === "dark" ? true : false;
    const savedFontSize = (getStoredValue("fontSize") || "medium") as "small" | "medium" | "large";
    const savedEditMode = getStoredValue("editMode") === "true";
    const savedCollapsed = getStoredValue("resultCollapsed") === "true";
    const savedHeightCollapsed = getStoredValue("heightCollapsed") === "true";
    const savedInputWidthExpanded = getStoredValue("inputWidthExpanded") === "true";
    const savedSingleLayout = getStoredValue("singleLayout") === "true";

    window.setTimeout(() => {
      setSourceText(savedSource);
      setTargetText(savedTarget);
      setIsDark(savedDark);
      setFontSize(savedFontSize);
      setIsEditMode(savedEditMode);
      setIsCollapsed(savedCollapsed);
      setHeightCollapsed(savedHeightCollapsed);
      setIsInputWidthExpanded(savedInputWidthExpanded);
      setIsSingleLayout(savedSingleLayout);
    }, 0);
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const updateJumpButtonVisibility = () => {
      const inputSection = inputSectionRef.current;
      if (!inputSection) {
        setShowJumpToInputs(false);
        return;
      }

      const rect = inputSection.getBoundingClientRect();
      setShowJumpToInputs(rect.top < -80);
    };

    updateJumpButtonVisibility();
    window.addEventListener("scroll", updateJumpButtonVisibility, { passive: true });
    window.addEventListener("resize", updateJumpButtonVisibility);

    return () => {
      window.removeEventListener("scroll", updateJumpButtonVisibility);
      window.removeEventListener("resize", updateJumpButtonVisibility);
    };
  }, [isHydrated]);

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSourceText(value);
    setStoredValue("sourceText", value);
  }, []);

  const handleTargetChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTargetText(value);
    setStoredValue("targetText", value);
  }, []);

  const handleThemeToggle = useCallback(() => {
    const newDark = !isDark;
    setIsDark(newDark);
    setStoredValue("theme", newDark ? "dark" : "light");
  }, [isDark]);

  const handleFontSizeChange = useCallback((size: "small" | "medium" | "large") => {
    setFontSize(size);
    setStoredValue("fontSize", size);
  }, []);

  const handleEditModeToggle = useCallback(() => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);
    setStoredValue("editMode", newMode ? "true" : "false");
  }, [isEditMode]);

  const handleCollapsedToggle = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    setStoredValue("resultCollapsed", newCollapsed ? "true" : "false");
  }, [isCollapsed]);

  const handleHeightToggle = useCallback(() => {
    const newHeight = !heightCollapsed;
    setHeightCollapsed(newHeight);
    setStoredValue("heightCollapsed", newHeight ? "true" : "false");
  }, [heightCollapsed]);

  const handleInputWidthExpandToggle = useCallback(() => {
    const newExpanded = !isInputWidthExpanded;
    setIsInputWidthExpanded(newExpanded);
    setStoredValue("inputWidthExpanded", newExpanded ? "true" : "false");
  }, [isInputWidthExpanded]);

  const handleLayoutToggle = useCallback(() => {
    const newLayout = !isSingleLayout;
    setIsSingleLayout(newLayout);
    setStoredValue("singleLayout", newLayout ? "true" : "false");
  }, [isSingleLayout]);

  const handleJumpToInputs = useCallback(() => {
    const inputSection = inputSectionRef.current;
    const sourceTextarea = sourceRef.current;
    const targetElement = sourceTextarea ?? inputSection;

    if (!targetElement) {
      return;
    }

    if (sourceTextarea) {
      sourceTextarea.focus({ preventScroll: true });
    }

    const rect = targetElement.getBoundingClientRect();
    const top = Math.max(0, window.scrollY + rect.top - 96);

    window.scrollTo({ top, behavior: "smooth" });
  }, []);

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
    setStoredValue(tutorialStorageKey, "true");
    setShowTutorial(false);
  }, []);

  const handleTutorialNext = useCallback(() => {
    setTutorialStep((currentStep) => {
      const nextStep = Math.min(currentStep + 1, tutorialSteps.length - 1);
      if (nextStep === currentStep) {
        setStoredValue(tutorialStorageKey, "true");
        setShowTutorial(false);
      }
      return nextStep;
    });
  }, []);

  const handleTutorialBack = useCallback(() => {
    setTutorialStep((currentStep) => Math.max(currentStep - 1, 0));
  }, []);

  const fontSizeStyles = {
    small: { fontSize: "14px" } as React.CSSProperties,
    medium: { fontSize: "16px" } as React.CSSProperties,
    large: { fontSize: "18px" } as React.CSSProperties,
  };

  const sourceTypography = getTypographyForText(sourceText);
  const targetTypography = getTypographyForText(targetText);

  const minHeight = "350px";
  const editorSectionWidth = isInputWidthExpanded
    ? "min(100rem, calc(100vw - 1rem))"
    : "min(72rem, calc(100vw - 3rem))";
  const editorSectionWidthStyle = {
    width: editorSectionWidth,
    transitionProperty: isLiteMode ? "none" : "width",
    transitionDuration: isLiteMode ? "0ms" : "520ms",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
  } as React.CSSProperties;
  const currentTutorial = tutorialSteps[tutorialStep];

  useEffect(() => {
    const textareas = [sourceRef.current, targetRef.current].filter(
      Boolean
    ) as HTMLTextAreaElement[];

    const resizeTextareas = () => {
      for (const textarea of textareas) {
        if (heightCollapsed) {
          textarea.style.height = "auto";
          textarea.style.overflowY = "hidden";
          textarea.style.height = `${Math.max(textarea.scrollHeight, textarea.offsetHeight)}px`;
        } else {
          textarea.style.height = minHeight;
          textarea.style.overflowY = "auto";
        }
      }
    };

    resizeTextareas();
    window.addEventListener("resize", resizeTextareas);

    return () => {
      window.removeEventListener("resize", resizeTextareas);
    };
  }, [heightCollapsed, minHeight, sourceText, targetText, fontSize, isHydrated]);

  // Prevent hydration mismatch by not rendering until after hydration
  if (!isHydrated) {
    return (
      <div
        className={cn(
          "min-h-screen bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_45%,#e2e8f0_100%)] text-slate-900 transition-colors duration-200 dark:bg-[radial-gradient(circle_at_top,#0f172a_0%,#020617_55%,#000_100%)] dark:text-slate-100"
        )}
        style={{ ...fontSizeStyles["medium"], fontFamily: vietnameseUIFontFamily }}
      >
        <div
          className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10"
          suppressHydrationWarning
        >
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-slate-950/50">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-3xl">
              📝
            </div>
            <h1 className="text-2xl font-bold">DTP Compare Tool</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Đang khởi tạo giao diện an toàn cho trình duyệt. Nếu Safari tải chậm hoặc gặp lỗi hiển
              thị, bạn vẫn sẽ thấy nền sáng thay vì màn hình đen.
            </p>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-2/3 rounded-full bg-linear-to-r from-sky-500 via-cyan-400 to-blue-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-200",
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900",
        isLiteMode && "motion-reduce"
      )}
      style={{ ...fontSizeStyles[fontSize], fontFamily: vietnameseUIFontFamily }}
    >
      {!showTutorial && showJumpToInputs && (
        <button
          type="button"
          onClick={handleJumpToInputs}
          className={cn(
            "fixed right-4 top-1/2 z-40 -translate-y-1/2 rounded-full border px-3 py-3 text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 md:right-6",
            isDark
              ? "border-sky-400/30 bg-slate-950/85 text-sky-200 shadow-slate-950/50 hover:bg-slate-900"
              : "border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-50"
          )}
          aria-label="Quay về đầu phần nhập văn bản"
          title="Quay về đầu phần nhập văn bản"
        >
          ↑
        </button>
      )}

      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <div
            className={cn(
              "w-full max-w-2xl rounded-3xl border p-6 shadow-xl",
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
          "relative mx-auto px-4 py-6 sm:px-6 lg:px-8",
          showTutorial && "pointer-events-none select-none"
        )}
        style={editorSectionWidthStyle}
      >
        <Header
          isDark={isDark}
          onThemeToggle={handleThemeToggle}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          onLayoutToggle={handleLayoutToggle}
          isLiteMode={isLiteMode}
        />

        {/* Editors */}
        <div
          ref={inputSectionRef}
          className={cn(
            "grid gap-6 mb-6 scroll-mt-24",
            isSingleLayout ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          <div
            className={cn(
              "p-5 rounded-2xl transition-[transform,width,padding,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
              isInputWidthExpanded ? "scale-[1.01]" : "scale-100",
              currentTutorial?.target === "source" &&
                (isDark
                  ? "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-950"
                  : "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-50"),
              isDark
                ? isLiteMode
                  ? "bg-[#1a1f3a]/95 border border-[#27306d]"
                  : "bg-[#1a1f3a]/80 border border-[#27306d] hover:border-[#3b82f6]/50 shadow-smooth-dark"
                : isLiteMode
                  ? "bg-white/95 border border-slate-200"
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
              style={{
                ...sourceTypography,
                ...fontSizeStyles[fontSize],
                height: heightCollapsed ? "auto" : minHeight,
                minHeight,
              }}
            />
          </div>

          <div
            className={cn(
              "p-5 rounded-2xl transition-[transform,width,padding,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
              isInputWidthExpanded ? "scale-[1.01]" : "scale-100",
              currentTutorial?.target === "target" &&
                (isDark
                  ? "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-950"
                  : "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-50"),
              isDark
                ? isLiteMode
                  ? "bg-[#1a1f3a]/95 border border-[#27306d]"
                  : "bg-[#1a1f3a]/80 border border-[#27306d] hover:border-[#3b82f6]/50 shadow-smooth-dark"
                : isLiteMode
                  ? "bg-white/95 border border-slate-200"
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
              style={{
                ...targetTypography,
                ...fontSizeStyles[fontSize],
                height: heightCollapsed ? "auto" : minHeight,
                minHeight,
              }}
            />
          </div>
        </div>

        {/* Size Toggle & Status */}
        <div
          className={cn(
            "mb-6 flex flex-wrap justify-center gap-3 rounded-2xl",
            currentTutorial?.target === "controls" &&
              (isDark
                ? "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-950"
                : "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-slate-50")
          )}
        >
          <button
            onClick={handleHeightToggle}
            className={cn(
              "px-6 py-2.5 rounded-lg font-semibold transition-colors duration-200",
              isDark
                ? "bg-linear-to-r from-blue-600 to-blue-700 hover:shadow-glow-blue text-white"
                : "bg-linear-to-r from-blue-500 to-blue-600 hover:shadow-smooth text-white"
            )}
            title="Mở rộng/thu gọn chiều cao input"
          >
            {heightCollapsed ? "⬆️ Thu gọn" : "⬇️ Mở rộng"}
          </button>

          <button
            onClick={handleInputWidthExpandToggle}
            className={cn(
              "px-6 py-2.5 rounded-lg font-semibold transition-colors duration-200",
              isInputWidthExpanded
                ? isDark
                  ? isLiteMode
                    ? "bg-[#27306d] text-slate-100"
                    : "bg-linear-to-r from-cyan-500 to-sky-600 text-white shadow-glow-cyan"
                  : isLiteMode
                    ? "bg-slate-300 text-slate-800"
                    : "bg-linear-to-r from-cyan-500 to-sky-600 text-white shadow-smooth"
                : isDark
                  ? isLiteMode
                    ? "bg-[#27306d] text-slate-200"
                    : "bg-[#27306d] text-slate-200 hover:bg-[#3b82f6]/30"
                  : isLiteMode
                    ? "bg-slate-200 text-slate-700"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            )}
            title="Dãn rộng thêm khung của cả hai ô nhập"
          >
            {isInputWidthExpanded ? "↔️ Rút rộng" : "↔️ Dãn rộng"}
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
          <div
            className={cn(
              "relative overflow-hidden p-6 rounded-2xl transition-colors duration-200",
              isDark
                ? isLiteMode
                  ? "bg-[#1a1f2b]/98 border border-[#27306d]"
                  : "bg-[#1a1f2b]/95 border border-[#27306d] shadow-smooth-dark"
                : isLiteMode
                  ? "bg-white/95 border border-slate-200"
                  : "bg-white/80 border border-slate-200 shadow-smooth"
            )}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold mr-2">📌 Kết Quả</h2>
                <div
                  className={cn(
                    "w-7 h-7 shrink-0 rounded-full animate-pulse-soft ring-2 ring-white/30 shadow-lg",
                    hasError
                      ? "bg-linear-to-br from-rose-300 via-red-400 to-fuchsia-500 shadow-[0_0_36px_rgba(251,113,133,0.98)]"
                      : "bg-linear-to-br from-lime-300 via-emerald-400 to-cyan-400 shadow-[0_0_36px_rgba(74,222,128,0.98)]"
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
                    "px-3 py-2 rounded-lg transition-colors duration-200",
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
                    "px-3 py-2 rounded-lg transition-colors duration-200 font-medium",
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
            originalFontFamily={sourceTypography.fontFamily}
            originalFontWeight={sourceTypography.fontWeight}
            testFontFamily={targetTypography.fontFamily}
            testFontWeight={targetTypography.fontWeight}
            fontSize={fontSize}
          />
        </div>

        {/* Footer */}
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
      </div>
    </div>
  );
}
