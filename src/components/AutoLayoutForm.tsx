"use client";
import React, { useCallback, useEffect, useState } from "react";

export type FormValues = {
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
  onGenerateAction: (values: FormValues) => void;
};

export default function AutoLayoutForm({ initial, isDark = false, onGenerateAction }: Props) {
  const singleFontFamily = "A-OTF Gothic MB101 Pro";
  const [text, setText] = useState(initial?.text ?? "日本語のテキストをここに入力してください。");
  const [width, setWidth] = useState(initial?.width?.toString() ?? "600");
  const [height, setHeight] = useState(initial?.height?.toString() ?? "400");
  const fontFamily = singleFontFamily;
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

  const formatFontSize = (value: number) => {
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
        if (obj.text) setText(String(obj.text));
        if (obj.width) setWidth(String(obj.width));
        if (obj.height) setHeight(String(obj.height));
        if (obj.fontSizePt) {
          setFontSizePt(formatFontSize(parseDecimalInput(String(obj.fontSizePt), 12)));
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
        text,
        width: Number(width || 600),
        height: Number(height || 400),
        fontFamily: singleFontFamily,
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
  }, [text, width, height, fontFamily, fontSizePt, space, targetLines, lineHeight, align]);

  const handleGenerate = () => {
    const parsedWidth = Math.max(50, Math.round(Number(width) || 600));
    const parsedHeight = Math.max(50, Math.round(Number(height) || 400));
    const parsedFontSizePt = Math.max(6, parseDecimalInput(fontSizePt, 12));
    const parsedSpace = Math.max(0, Math.round(Number(space) || 0));
    const parsedTargetLines = Math.max(1, Math.round(Number(targetLines) || 4));
    const parsedLineHeight = Math.min(3, Math.max(1, Number(lineHeight) || 1.4));

    void runGenerate({
      text,
      width: parsedWidth,
      height: parsedHeight,
      fontFamily,
      fontSizePt: parsedFontSizePt,
      space: parsedSpace,
      targetLines: parsedTargetLines,
      lineHeight: parsedLineHeight,
      align,
    });

    try {
      window.localStorage.setItem(
        "autolayout.v1",
        JSON.stringify({
          text,
          width: parsedWidth,
          height: parsedHeight,
          fontFamily: singleFontFamily,
          fontSizePt: parsedFontSizePt,
          space: parsedSpace,
          targetLines: parsedTargetLines,
          lineHeight: parsedLineHeight,
          align,
        })
      );
    } catch {
      // ignore
    }
  };

  return (
    <form className="space-y-4 p-4">
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
            "w-full mt-1 h-40 p-2 border rounded-md resize-vertical text-sm transition-colors duration-200 " +
            (isDark
              ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
              : "bg-white border-slate-300 text-slate-900 placeholder-slate-500")
          }
        />
      </div>

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
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            step={1}
            min={50}
            value={width}
            onChange={(e) => setWidth(e.target.value === "" ? "" : e.target.value)}
            onBlur={() =>
              setWidth((value) => {
                const num = Math.max(50, Math.round(Number(value) || 50));
                return num.toString();
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
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            step={1}
            min={50}
            value={height}
            onChange={(e) => setHeight(e.target.value === "" ? "" : e.target.value)}
            onBlur={() =>
              setHeight((value) => {
                const num = Math.max(50, Math.round(Number(value) || 50));
                return num.toString();
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
          <input
            value={singleFontFamily}
            readOnly
            aria-label="font-family"
            className={
              "w-full mt-1 p-2 border rounded-md transition-colors duration-200 " +
              (isDark
                ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-500")
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
                return formatFontSize(num);
              })
            }
            aria-label="font-size-pt"
            className={
              "w-full mt-1 p-2 border rounded-md transition-colors duration-200 outline-none " +
              (isDark
                ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:ring-sky-400"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500")
            }
          />
        </div>
      </div>

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
            type="number"
            inputMode="numeric"
            step={1}
            min={0}
            max={200}
            value={space}
            onChange={(e) => setSpace(e.target.value === "" ? "" : e.target.value)}
            onBlur={() =>
              setSpace((value) => {
                const num = Math.max(0, Math.round(Number(value) || 0));
                return num.toString();
              })
            }
            aria-label="space-px"
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
            Khoảng cách dòng
          </label>
          <input
            type="number"
            inputMode="decimal"
            step={0.1}
            min={1}
            max={3}
            value={lineHeight}
            onChange={(e) => setLineHeight(e.target.value === "" ? "" : e.target.value)}
            onBlur={() =>
              setLineHeight((value) => {
                const num = Math.min(3, Math.max(1, Number(value) || 1.4));
                return num.toFixed(1);
              })
            }
            aria-label="line-height"
            className={
              "w-full mt-1 p-2 border rounded-md transition-colors duration-200 " +
              (isDark
                ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:ring-sky-400"
                : "bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500")
            }
          />
        </div>
      </div>

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
            Căn lề
          </label>
          <select
            value={align}
            onChange={(e) => setAlign(e.target.value as FormValues["align"])}
            className={
              "w-full mt-1 p-2 border rounded-md transition-colors duration-200 " +
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

      <div className="flex gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            className={
              "h-10 min-w-35 px-4 rounded-md font-semibold transition-colors duration-200 " +
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
  );
}
