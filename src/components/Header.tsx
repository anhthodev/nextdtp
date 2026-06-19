"use client";

import React from "react";
import { Sun, Moon, HelpCircle, Layout } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
  fontSize: "small" | "medium" | "large";
  onFontSizeChange: (size: "small" | "medium" | "large") => void;
  onLayoutToggle: () => void;
  isLiteMode?: boolean;
}

export function Header({
  isDark,
  onThemeToggle,
  fontSize,
  onFontSizeChange,
  onLayoutToggle,
  isLiteMode = false,
}: HeaderProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header
        className={cn(
          "mb-8 flex items-center justify-between border-b px-2 pb-6 transition-colors duration-200",
          isDark
            ? "border-slate-800 bg-slate-950/95 text-slate-100"
            : "border-slate-200 bg-white/95 text-slate-900"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="text-3xl">📝</div>
          <div>
            <h1
              className={cn(
                "text-3xl font-bold bg-linear-to-r",
                isDark ? "from-slate-100 to-slate-300" : "from-slate-900 to-slate-700"
              )}
              style={{ backgroundClip: "text", WebkitBackgroundClip: "text" }}
            >
              DTP Compare
            </h1>
            <p className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-slate-600")}>
              Công cụ so sánh văn bản thông minh
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <Select
            value={fontSize}
            onValueChange={(value) => onFontSizeChange(value as "small" | "medium" | "large")}
          >
            <SelectTrigger
              className={cn(
                "w-auto rounded-lg transition-colors duration-200",
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
                  : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50 hover:border-slate-400"
              )}
            >
              <SelectValue className={isDark ? "text-slate-100" : "text-slate-900"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">🔹 Nhỏ (14px)</SelectItem>
              <SelectItem value="medium">🔷 Vừa (16px)</SelectItem>
              <SelectItem value="large">🔶 Lớn (18px)</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => setShowHelp(true)}
            className={cn(
              "p-2.5 rounded-lg transition-colors duration-200 hover:scale-[1.02] active:scale-95",
              isDark
                ? "bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100"
                : "bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900"
            )}
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <Link
            href="/auto-layout"
            className={cn(
              "p-2.5 rounded-lg transition-colors duration-200 hover:scale-[1.02] active:scale-95",
              isDark
                ? "bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100"
                : "bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900"
            )}
            title="Canh dòng"
          >
            Canh dòng
          </Link>

          <button
            onClick={onLayoutToggle}
            className={cn(
              "p-2.5 rounded-lg transition-colors duration-200 hover:scale-[1.02] active:scale-95",
              isDark
                ? "bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100"
                : "bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900"
            )}
            title="Bố cục"
          >
            <Layout className="w-4 h-4" />
          </button>

          <button
            onClick={onThemeToggle}
            className={cn(
              "p-2.5 rounded-lg transition-colors duration-200 hover:scale-[1.02] active:scale-95",
              isDark
                ? "bg-linear-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20 border border-[#3b82f6]/50 text-yellow-300 hover:text-yellow-200"
                : "bg-linear-to-r from-blue-100 to-sky-100 border border-slate-300 text-slate-700 hover:text-slate-900"
            )}
            title="Chế độ sáng/tối"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent
          className={cn(
            "max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl",
            isDark
              ? isLiteMode
                ? "border border-[#27306d] bg-[#1a1f3a]"
                : "border border-[#27306d] bg-[#1a1f3a] shadow-xl"
              : isLiteMode
                ? "border border-slate-200 bg-slate-50 text-slate-900"
                : "border border-slate-200 bg-slate-50 text-slate-900 shadow-slate-300/30"
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn(
                "text-2xl font-bold flex items-center gap-2",
                isDark ? "text-slate-100" : "text-slate-900"
              )}
            >
              <span className="text-2xl">📖</span> Hướng Dẫn Sử Dụng
            </DialogTitle>
            <DialogDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
              Tìm hiểu cách sử dụng DTP Compare Tool
            </DialogDescription>
          </DialogHeader>

          <div className={cn("space-y-4 text-sm", isDark ? "text-slate-300" : "text-slate-700")}>
            <div
              className={cn(
                "rounded-2xl border p-4",
                isDark
                  ? "border-sky-500/30 bg-sky-500/10 text-slate-100"
                  : "border-sky-200 bg-sky-50 text-slate-800"
              )}
            >
              <p className="font-semibold">Lưu ý cho lần đầu</p>
              <p className="mt-1">
                Bạn sẽ đi qua một hướng dẫn ngắn theo từng bước. Hoàn thành xong, hệ thống sẽ nhớ và
                không hỏi lại ở lần vào sau.
              </p>
            </div>

            <div
              className={cn(
                "p-4 rounded-xl",
                isDark
                  ? isLiteMode
                    ? "bg-[#0f1535] border border-[#27306d]"
                    : "bg-[#0f1535] border border-[#27306d]"
                  : isLiteMode
                    ? "bg-white border border-slate-200"
                    : "bg-white border border-slate-200 shadow-sm"
              )}
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>1️⃣</span> Nhập văn bản gốc
              </h3>
              <p>Ô bên trái là bản gốc. Đây là nội dung chuẩn để hệ thống dùng làm mốc so sánh.</p>
            </div>

            <div
              className={cn(
                "p-4 rounded-xl",
                isDark
                  ? "bg-[#0f1535] border border-[#27306d]"
                  : "bg-white border border-slate-200 shadow-sm"
              )}
            >
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>2️⃣</span> Nhập văn bản cần kiểm tra
              </h3>
              <p>
                Ô bên phải là nội dung mới. Khi bạn gõ vào đây, trang sẽ tự so sánh và tô màu khác
                biệt ngay lập tức.
              </p>
            </div>

            <div
              className={cn(
                "p-4 rounded-xl",
                isDark
                  ? "bg-[#0f1535] border border-[#27306d]"
                  : "bg-white border border-slate-200 shadow-sm"
              )}
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>3️⃣</span> Đọc kết quả so sánh
              </h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-red-500 rounded" />
                  <strong>Ký tự sai/thừa:</strong> Ký tự được đánh dấu bằng nền đỏ là ký tự sai hoặc
                  thừa.
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-blue-500 rounded" />
                  <strong>Ký tự thiếu:</strong> Ô xanh nhỏ cho biết ký tự bị thiếu so với bản gốc.
                </p>
                <p>
                  Bạn có thể nhấp vào ký tự khi bật chế độ chỉnh sửa để nhảy tới vị trí tương ứng.
                </p>
              </div>
            </div>

            <div
              className={cn(
                "p-4 rounded-xl",
                isDark
                  ? "bg-[#0f1535] border border-[#27306d]"
                  : "bg-white border border-slate-200 shadow-sm"
              )}
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>4️⃣</span> Dùng các nút điều khiển
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>🔹/🔷/🔶:</strong> Đổi cỡ chữ hiển thị.
                </li>
                <li>
                  <strong>📐:</strong> Chuyển giữa bố cục 1 cột và 2 cột.
                </li>
                <li>
                  <strong>☀️/🌙:</strong> Chuyển chế độ sáng/tối.
                </li>
                <li>
                  <strong>❓:</strong> Mở lại hướng dẫn này bất cứ lúc nào.
                </li>
              </ul>
            </div>

            <div
              className={cn(
                "p-4 rounded-xl",
                isDark
                  ? "bg-[#0f1535] border border-[#27306d]"
                  : "bg-white border border-slate-200 shadow-sm"
              )}
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span>5️⃣</span> Mẹo khi dùng
              </h3>
              <p>
                Nếu đây là lần đầu vào trang, bạn sẽ thấy hướng dẫn theo bước. Sau khi hoàn tất, hệ
                thống sẽ nhớ và không hiện lại ở lần truy cập sau.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
