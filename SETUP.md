# DTP Compare Tool - Quick Start Guide

## 🚀 Bắt đầu nhanh

### Yêu cầu
- Node.js 18+ (khuyên dùng 20 LTS)
- npm 9+ hoặc yarn/pnpm

### Cài đặt & Chạy

```bash
# 1. Vào folder dự án
cd d:\dtpcompare

# 2. Cài đặt dependencies (nếu chưa)
npm install

# 3. Chạy development server
npm run dev

# 4. Mở trình duyệt
# http://localhost:3000
```

## 📁 Cấu trúc Project

```
dtpcompare/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── src/
│   ├── components/          # React components
│   │   ├── DTPCompare.tsx   # Main component
│   │   ├── Header.tsx       # Header & controls
│   │   ├── ResultDisplay.tsx # Results panel
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom hooks
│   │   └── useCompare.ts    # Comparison logic
│   ├── lib/                 # Utilities
│   │   ├── normalize.ts     # Text normalization
│   │   └── utils.ts         # Helper functions
│   └── types/               # TypeScript types
├── .vscode/                 # VS Code settings
├── public/                  # Static files
└── package.json             # Dependencies
```

## 🎮 Sử dụng

### Nhập Văn Bản
1. Nhập văn bản gốc vào ô trái
2. Nhập văn bản kiểm tra vào ô phải
3. Kết quả so sánh xuất hiện ngay lập tức

### Kết Quả
- **Ký tự sai/thừa** (đỏ): Ký tự không khớp hoặc thừa
- **Ký tự thiếu** (xanh): Ký tự bị thiếu so với bản gốc

### Điều Khiển
| Button | Chức năng |
|--------|----------|
| 🔹/🔷/🔶 | Thay đổi kích cỡ chữ |
| ❓ | Xem hướng dẫn |
| 📐 | Bố cục một/hai cột |
| ☀️/🌙 | Chế độ sáng/tối |
| ⬆️/⬇️ | Thu gọn chiều cao |
| ➡️/⬅️ | Ẩn/hiện bản gốc |
| 🖊️ | Chế độ chỉnh sửa |

## 🔧 Câu lệnh npm

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Build for production
npm start        # Chạy production build
npm run lint     # Kiểm tra code style
npm run lint --fix # Fix linting issues
```

## 📊 Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons (SVG, nhẹ)
- **Radix UI** - Accessible primitives

## ⚡ Tối ưu Hóa

Dự án được tối ưu cho Mac Mini 8GB:

- ✅ Minimal dependencies (chỉ cần thiết)
- ✅ Tree-shaking (loại bỏ code không dùng)
- ✅ Code splitting tự động
- ✅ CSS purging (Tailwind)
- ✅ SVG icons (nhẹ hơn PNG)
- ✅ Image optimization
- ✅ Production source maps disabled

## 🌐 Deployment

### Vercel (Khuyên dùng - miễn phí)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Docker

```bash
docker build -t dtpcompare .
docker run -p 3000:3000 dtpcompare
```

## 🐛 Troubleshooting

### Port 3000 đã sử dụng

```bash
npm run dev -- -p 3001
```

### Xóa cache & reinstall

```bash
rm -r node_modules package-lock.json
npm install
```

### Build fail

```bash
npm run build -- --verbose
```

## 💡 Mẹo Hiệu Suất

- Sử dụng Dark Mode để tiết kiệm pin
- Đóng các tab không cần
- Xóa cache trình duyệt nếu lỗi
- Update Node.js lên phiên bản mới nhất

## 📝 Notes

- Dữ liệu được lưu trong localStorage
- App hoạt động offline
- Không có dependencies external/API
- Hỗ trợ Vietnamese characters

## 📞 Support

Có vấn đề? Hãy kiểm tra:
1. Node.js version >= 18
2. Port 3000 có sẵn
3. npm cache: `npm cache clean --force`

---

**Made with ❤️ by anhthodev** 🚀

**Version: 1.0.0** | **Next.js 16.2.9** | **React 19**
