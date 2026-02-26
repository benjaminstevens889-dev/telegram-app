# برنامه تلگرام - راهنمای نصب

## نیازمندی‌ها
- Node.js 18+
- PostgreSQL دیتابیس
- npm یا bun

## مراحل نصب

### 1. Extract فایل
```bash
unzip telegram-complete.zip
cd my-project
```

### 2. نصب وابستگی‌ها
```bash
npm install
```

### 3. تنظیم دیتابیس
فایل `.env` در ریشه پروژه بسازید:
```
DATABASE_URL="postgresql://user:password@localhost:5432/telegram"
```

### 4. ایجاد جداول دیتابیس
```bash
npx prisma generate
npx prisma db push
```

### 5. اجرای برنامه
```bash
npm run dev
```

برنامه روی http://localhost:3000 اجرا می‌شود.

## ساختار پروژه
```
src/
├── app/
│   ├── api/          # API endpoints
│   ├── page.tsx      # صفحه اصلی
│   └── globals.css   # استایل‌ها
├── components/       # کامپوننت‌ها
├── hooks/           # هوک‌ها
├── lib/             # کتابخانه‌ها
├── store/           # Zustand store
└── types/           # تایپ‌ها
prisma/
└── schema.prisma    # ساختار دیتابیس
```

## قابلیت‌ها
- چت خصوصی
- چت گروهی
- ارسال فایل
- ارسال ویس
- ساخت گروه و کانال
- و...
