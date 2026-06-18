import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DTP Compare Tool",
  description: "Công cụ so sánh văn bản DTP với phát hiện lỗi nâng cao",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75'>📝</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${notoSansJp.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="h-full">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (error) {
                // ignore if localStorage is unavailable
              }
            })();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
