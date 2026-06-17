# DTP Compare Tool

Công cụ so sánh văn bản DTP nâng cao được xây dựng với Next.js, TypeScript, Tailwind CSS và shadcn/ui.

## 🌟 Tính năng

- ✨ **So sánh văn bản thông minh** - Phát hiện các ký tự sai, thiếu hoặc thừa
- 🎨 **UI đẹp và mượt mà** - Thiết kế hiện đại với Tailwind CSS
- 🌓 **Hỗ trợ Dark Mode** - Chuyển đổi giữa chế độ sáng/tối
- 📱 **Responsive Design** - Hoạt động tốt trên tất cả các thiết bị
- ⚡ **Tối ưu hóa hiệu suất** - Tối ưu cho Mac Mini 8GB
- 💾 **Lưu trữ cục bộ** - Tự động lưu dữ liệu trong localStorage
- 🎯 **Chế độ chỉnh sửa** - Click vào ký tự để nhanh chóng điều hướng
- 📊 **Bố cục linh hoạt** - Chuyển đổi giữa bố cục một/hai cột

## 🚀 Bắt đầu

### Yêu cầu

- Node.js 18+ 
- npm 9+

### Cài đặt

```bash
cd dtpcompare
npm install
```

### Chạy ứng dụng

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 📁 Cấu trúc dự án

```
dtpcompare/
├── app/                    # Next.js App Router
├── src/
│   ├── components/         # React components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & helpers
│   └── types/             # TypeScript types
├── public/                # Static assets
└── package.json           # Dependencies
```

## 📝 Scripts

```bash
npm run dev      # Chạy development server
npm run build    # Build production
npm start        # Chạy production
npm run lint     # Kiểm tra linting
```

## 🌐 Deployment

Dễ dàng deploy trên Vercel:

```bash
npm install -g vercel
vercel
```

## 📊 Technologies

- **Next.js 14** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Lucide React** - Beautiful icons
- **Radix UI** - Accessible primitives

## 💡 Tối ưu hóa

Dự án được tối ưu hóa cho Mac Mini 8GB:
- Minimal dependencies
- Tree-shaking
- Code splitting tự động
- CSS purging
- SVG icons (nhẹ)

Made with ❤️ by anhthodev 🚀
