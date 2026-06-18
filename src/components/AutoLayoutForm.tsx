"use client";
import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export type FormValues = {
  layoutMode: "technical" | "line-check";
  text: string;
  width: number;
  height: number;
  fontFamily: string;
  fontSizePt: number;
  space: number;
  targetLines: number;
  lineHeight: number;
  align: "left" | "center" | "right";
};

type Props = {
  initial?: Partial<FormValues>;
  isDark?: boolean;
  collapsed?: boolean;
  onToggleCollapseAction?: () => void;
  onGenerateAction: (values: FormValues) => void;
};

export default function AutoLayoutForm({
  initial,
  isDark = false,
  collapsed = false,
  onToggleCollapseAction,
  onGenerateAction,
}: Props) {
  const fontOptions = [
    { label: "A-OTF Gothic MB101 Pro", value: "A-OTF Gothic MB101 Pro" },
    { label: "Noto Sans JP", value: '"Noto Sans JP", sans-serif' },
    { label: "Hiragino Sans", value: '"Hiragino Sans", "Yu Gothic", sans-serif' },
    { label: "Yu Gothic", value: '"Yu Gothic", "Hiragino Sans", sans-serif' },
  ];
  const singleFontFamily = initial?.fontFamily ?? fontOptions[0].value;
  const [layoutMode, setLayoutMode] = useState<FormValues["layoutMode"]>(
    initial?.layoutMode ?? "technical"
  );
  const [text, setText] = useState(initial?.text ?? "日本語のテキストをここに入力してください。");
  const [width, setWidth] = useState(initial?.width?.toString() ?? "600");
  const [height, setHeight] = useState(initial?.height?.toString() ?? "400");
  const [fontFamily, setFontFamily] = useState(initial?.fontFamily ?? singleFontFamily);
  const [fontSizePt, setFontSizePt] = useState(initial?.fontSizePt?.toString() ?? "12");
  const [space, setSpace] = useState(initial?.space?.toString() ?? "8");
  const [targetLines, setTargetLines] = useState(initial?.targetLines?.toString() ?? "4");
  const [lineHeight, setLineHeight] = useState(initial?.lineHeight?.toString() ?? "1.4");
  const [align, setAlign] = useState<FormValues["align"]>(initial?.align ?? "left");

  const parseDecimalInput = (value: string, fallback: number) => {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const formatDecimalInput = (value: number) => {
    if (Number.isInteger(value)) {
      return String(value);
    }

    return value.toFixed(1).replace(".", ",");
  };

  const restoreSavedValues = useCallback(() => {
    try {
      const saved = window.localStorage.getItem("autolayout.v1");
      if (!saved) {
        return;
      }

      const obj = JSON.parse(saved) as Partial<Record<keyof FormValues, string | number>>;
      window.setTimeout(() => {
        if (obj.layoutMode) setLayoutMode(String(obj.layoutMode) as FormValues["layoutMode"]);
        if (obj.text) setText(String(obj.text));
        if (obj.width) setWidth(String(obj.width));
        if (obj.height) setHeight(String(obj.height));
        if (obj.fontFamily) setFontFamily(String(obj.fontFamily));
        if (obj.fontSizePt) {
          setFontSizePt(formatDecimalInput(parseDecimalInput(String(obj.fontSizePt), 12)));
        }
        if (obj.space) setSpace(String(obj.space));
        if (obj.targetLines) setTargetLines(String(obj.targetLines));
        if (obj.lineHeight) setLineHeight(String(obj.lineHeight));
        if (obj.align) setAlign(String(obj.align) as FormValues["align"]);
      }, 0);
    } catch {
      // ignore
    }
  }, []);

  const runGenerate = async (values: FormValues) => {
    await onGenerateAction(values);
  };

  useEffect(() => {
    restoreSavedValues();
  }, [restoreSavedValues]);

  useEffect(() => {
    try {
      const payload = JSON.stringify({
        layoutMode,
        text,
        width: Number(width || 600),
        height: Number(height || 400),
        fontFamily,
        fontSizePt: parseDecimalInput(fontSizePt, 12),
        space: Number(space || 8),
        targetLines: Number(targetLines || 4),
        lineHeight: Number(lineHeight || 1.4),
        align,
      });
      window.localStorage.setItem("autolayout.v1", payload);
    } catch {
      // ignore
    }
  }, [
    layoutMode,
    text,
    width,
    height,
    fontFamily,
    fontSizePt,
    space,
    targetLines,
    lineHeight,
    align,
  ]);

  const handleGenerate = () => {
    const isLineCheckMode = layoutMode === "line-check";
    const parsedWidth = isLineCheckMode ? 600 : Math.max(50, parseDecimalInput(width, 600));
    const parsedHeight = isLineCheckMode ? 400 : Math.max(50, parseDecimalInput(height, 400));
    const parsedFontSizePt = Math.max(6, parseDecimalInput(fontSizePt, 12));
    const parsedSpace = isLineCheckMode ? 0 : Math.max(0, parseDecimalInput(space, 0));
    const parsedTargetLines = isLineCheckMode
      ? 4
      : Math.max(1, Math.round(Number(targetLines) || 4));
    const parsedLineHeight = isLineCheckMode
      ? 1.4
      : Math.min(3, Math.max(1, parseDecimalInput(lineHeight, 1.4)));
    const parsedAlign = isLineCheckMode ? "left" : align;

    void runGenerate({
      layoutMode,
      text,
      width: parsedWidth,
      height: parsedHeight,
      fontFamily,
      fontSizePt: parsedFontSizePt,
      space: parsedSpace,
      targetLines: parsedTargetLines,
      lineHeight: parsedLineHeight,
      align: parsedAlign,
    });

    try {
      window.localStorage.setItem(
        "autolayout.v1",
        JSON.stringify({
          layoutMode,
          text,
          width: parsedWidth,
          height: parsedHeight,
          fontFamily,
          fontSizePt: parsedFontSizePt,
          space: parsedSpace,
          targetLines: parsedTargetLines,
          lineHeight: parsedLineHeight,
          align: parsedAlign,
        })
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative h-full">
      <button
        type="button"
        onClick={onToggleCollapseAction}
        className={
          "absolute -right-3 top-4 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition-all duration-200 " +
          (isDark
            ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50")
        }
        aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {collapsed ? (
        <div className="flex h-full min-h-55 items-start justify-center p-3 pt-14" />
      ) : (
        <form className="space-y-4 p-4 pr-6">
          <div>
            <label
              className={
                isDark
                  ? "block text-sm font-medium text-slate-200"
                  : "block text-sm font-medium text-slate-700"
              }
            >
              Chế độ
            </label>
            <Select
              value={layoutMode}
              onValueChange={(value) => setLayoutMode(value as FormValues["layoutMode"])}
            >
              <SelectTrigger
                className={
                  "mt-1 h-9 w-full rounded-md text-sm transition-colors duration-200 " +
                  (isDark
                    ? "bg-slate-900 border-slate-700 text-slate-100"
                    : "bg-white border-slate-300 text-slate-900")
                }
                aria-label="layout-mode"
              >
                <SelectValue placeholder="Chọn chế độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Kỹ thuật</SelectItem>
                <SelectItem value="line-check">Kiểm tra ngắt dòng</SelectItem>
              </SelectContent>
            </Select>
            {layoutMode === "line-check" && (
              <p className={isDark ? "mt-2 text-xs text-slate-400" : "mt-2 text-xs text-slate-500"}>
                Chế độ này ẩn các input kỹ thuật, chỉ tập trung vào text và highlight chỗ ngắt dòng.
              </p>
            )}
          </div>

          <div>
            <label
              className={
                isDark
                  ? "block text-sm font-medium text-slate-200"
                  : "block text-sm font-medium text-slate-700"
              }
            >
              Văn bản (Tiếng Nhật)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={
                "w-full mt-1 h-36 p-2.5 border rounded-md resize-vertical text-sm leading-5 transition-colors duration-200 " +
                (isDark
                  ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-500")
              }
              style={{ fontFamily }}
            />
          </div>

          {layoutMode === "technical" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={
                    isDark
                      ? "block text-sm font-medium text-slate-200"
                      : "block text-sm font-medium text-slate-700"
                  }
                >
                  Chiều rộng (px)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  min={50}
                  value={width}
                  onChange={(e) => setWidth(e.target.value === "" ? "" : e.target.value)}
                  onBlur={() =>
                    setWidth((value) => {
                      const num = Math.max(50, parseDecimalInput(value, 50));
                      return formatDecimalInput(num);
                    })
                  }
                  aria-label="width-px"
                  className={
                    "w-full mt-1 p-2 border rounded-md transition-colors duration-200 " +
                    (isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:ring-sky-400"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500")
                  }
                />
              </div>

              <div>
                <label
                  className={
                    isDark
                      ? "block text-sm font-medium text-slate-200"
                      : "block text-sm font-medium text-slate-700"
                  }
                >
                  Chiều cao (px)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  min={50}
                  value={height}
                  onChange={(e) => setHeight(e.target.value === "" ? "" : e.target.value)}
                  onBlur={() =>
                    setHeight((value) => {
                      const num = Math.max(50, parseDecimalInput(value, 50));
                      return formatDecimalInput(num);
                    })
                  }
                  aria-label="height-px"
                  className={
                    "w-full mt-1 p-2 border rounded-md transition-colors duration-200 " +
                    (isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:ring-sky-400"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500")
                  }
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={
                  isDark
                    ? "block text-sm font-medium text-slate-200"
                    : "block text-sm font-medium text-slate-700"
                }
              >
                Font chữ
              </label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger
                  className={
                    "mt-1 h-9 w-full rounded-md text-sm transition-colors duration-200 " +
                    (isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100"
                      : "bg-white border-slate-300 text-slate-900")
                  }
                  aria-label="font-family"
                >
                  <SelectValue placeholder="Chọn font" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                className={
                  isDark
                    ? "block text-sm font-medium text-slate-200"
                    : "block text-sm font-medium text-slate-700"
                }
              >
                Cỡ chữ (pt)
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                min={6}
                value={fontSizePt}
                onChange={(e) => setFontSizePt(e.target.value)}
                onBlur={() =>
                  setFontSizePt((value) => {
                    const num = Math.max(6, parseDecimalInput(value, 12));
                    return formatDecimalInput(num);
                  })
                }
                aria-label="font-size-pt"
                className={
                  "w-full mt-1 p-2 border rounded-md text-sm leading-5 transition-colors duration-200 outline-none " +
                  (isDark
                    ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:ring-sky-400"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500")
                }
              />
            </div>
          </div>

          {layoutMode === "technical" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={
                    isDark
                      ? "block text-sm font-medium text-slate-200"
                      : "block text-sm font-medium text-slate-700"
                  }
                >
                  Space thêm (px)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  min={0}
                  max={200}
                  value={space}
                  onChange={(e) => setSpace(e.target.value === "" ? "" : e.target.value)}
                  onBlur={() =>
                    setSpace((value) => {
                      const num = Math.max(0, parseDecimalInput(value, 0));
                      return formatDecimalInput(num);
                    })
                  }
                  aria-label="space-px"
                  className={
                    "w-full mt-1 p-2 border rounded-md text-sm leading-5 transition-colors duration-200 " +
                    (isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:ring-sky-400"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500")
                  }
                />
              </div>

              <div>
                <label
                  className={
                    isDark
                      ? "block text-sm font-medium text-slate-200"
                      : "block text-sm font-medium text-slate-700"
                  }
                >
                  Khoảng cách dòng
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  min={1}
                  max={3}
                  value={lineHeight}
                  onChange={(e) => setLineHeight(e.target.value === "" ? "" : e.target.value)}
                  onBlur={() =>
                    setLineHeight((value) => {
                      const num = Math.min(3, Math.max(1, parseDecimalInput(value, 1.4)));
                      return formatDecimalInput(num);
                    })
                  }
                  aria-label="line-height"
                  className={
                    "w-full mt-1 p-2 border rounded-md text-sm leading-5 transition-colors duration-200 " +
                    (isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:ring-sky-400"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500")
                  }
                />
              </div>
            </div>
          )}

          {layoutMode === "technical" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={
                    isDark
                      ? "block text-sm font-medium text-slate-200"
                      : "block text-sm font-medium text-slate-700"
                  }
                >
                  Số dòng mục tiêu
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  step={1}
                  min={1}
                  max={200}
                  value={targetLines}
                  onChange={(e) => setTargetLines(e.target.value === "" ? "" : e.target.value)}
                  onBlur={() =>
                    setTargetLines((value) => {
                      const num = Math.max(1, Math.round(Number(value) || 1));
                      return num.toString();
                    })
                  }
                  aria-label="target-lines"
                  className={
                    "w-full mt-1 p-2 border rounded-md text-sm leading-5 transition-colors duration-200 " +
                    (isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:ring-sky-400"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500")
                  }
                />
              </div>

              <div>
                <label
                  className={
                    isDark
                      ? "block text-sm font-medium text-slate-200"
                      : "block text-sm font-medium text-slate-700"
                  }
                >
                  Căn lề
                </label>
                <select
                  value={align}
                  onChange={(e) => setAlign(e.target.value as FormValues["align"])}
                  className={
                    "w-full mt-1 p-2 border rounded-md text-sm leading-5 transition-colors duration-200 " +
                    (isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-sky-400 focus:ring-sky-400"
                      : "bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500")
                  }
                >
                  <option value="left">Trái</option>
                  <option value="center">Giữa</option>
                  <option value="right">Phải</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                className={
                  "h-9 min-w-35 px-4 rounded-md text-sm font-semibold transition-colors duration-200 " +
                  (isDark
                    ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-glow-blue hover:from-blue-500 hover:to-blue-600"
                    : "bg-slate-900 text-white hover:bg-slate-800")
                }
              >
                Tạo bố cục
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
