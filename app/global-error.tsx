"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a0e27",
          color: "#e0e9ff",
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <main
          style={{
            width: "min(720px, calc(100vw - 2rem))",
            border: "1px solid rgba(39, 48, 109, 0.9)",
            borderRadius: "24px",
            background: "rgba(26, 31, 58, 0.96)",
            padding: "2rem",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
          }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.8 }}>DTP Compare</p>
          <h1 style={{ margin: "0.5rem 0 1rem", fontSize: "2rem", lineHeight: 1.1 }}>
            Trang đã gặp lỗi trên trình duyệt này.
          </h1>
          <p style={{ margin: 0, lineHeight: 1.6, color: "#c7d2fe" }}>
            Nếu Safari không tải được giao diện, hãy tải lại trang. Lỗi này sẽ không để lại màn hình
            đen trống.
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: "999px",
                padding: "0.875rem 1.25rem",
                background: "#3b82f6",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Tải lại giao diện
            </button>
            <Link
              href="/"
              style={{
                borderRadius: "999px",
                padding: "0.875rem 1.25rem",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                color: "#e0e9ff",
                textDecoration: "none",
              }}
            >
              Về trang chủ
            </Link>
          </div>
          <pre
            style={{
              marginTop: "1.5rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.8rem",
              lineHeight: 1.5,
              padding: "1rem",
              borderRadius: "16px",
              background: "rgba(15, 21, 53, 0.9)",
              color: "#93c5fd",
            }}
          >
            {error.message}
          </pre>
        </main>
      </body>
    </html>
  );
}
