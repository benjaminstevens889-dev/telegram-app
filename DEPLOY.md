# راهنمای دیپلوی تلگرام روی اینترنت عمومی

## روش ۱: Render (ساده‌ترین و رایگان)

### مرحله ۱: کد را به GitHub بفرستید

```bash
# در پوشه پروژه دستورات زیر را اجرا کنید:

git init
git add .
git commit -m "Telegram app ready for deploy"

# یک repository در GitHub بسازید
# سپس دستورات زیر را اجرا کنید:

git remote add origin https://github.com/YOUR_USERNAME/telegram-app.git
git branch -M main
git push -u origin main
```

### مرحله ۲: ثبت‌نام در Render

1. به آدرس **https://render.com** بروید
2. روی **"Sign Up"** کلیک کنید
3. با **GitHub** ثبت‌نام کنید (ساده‌تر است)

### مرحله ۳: ساخت Web Service

1. در داشبورد Render روی **"New +"** کلیک کنید
2. **"Web Service"** را انتخاب کنید
3. Repository خود را انتخاب کنید
4. تنظیمات را این‌طور پر کنید:

| فیلد | مقدار |
|------|-------|
| Name | telegram-app |
| Region | Frankfurt |
| Branch | main |
| Runtime | Docker |
| Instance Type | Free |

### مرحله ۴: متغیرهای محیطی

در بخش **"Environment Variables"** این‌ها را اضافه کنید:

```
DATABASE_URL=file:/app/data/telegram.db
SESSION_SECRET=یک_عبارت_تصادفی_بلند_حداقل_۳۲_کاراکتر
```

### مرحله ۵: دیپلوی

روی **"Deploy Web Service"** کلیک کنید.

اولین دیپلوی حدود 5-10 دقیقه طول می‌کشد.

---

## بعد از دیپلوی

یک آدرس مثل این خواهید داشت:
```
https://telegram-app-xxxx.onrender.com
```

✅ این آدرس را به دوستتان بدهید
✅ هر دو می‌توانید ثبت‌نام کنید
✅ تماس تصویری و صوتی از اینترنت کار می‌کند

---

## روش ۲: Railway (البته رایگان نیست برای همیشه)

1. به https://railway.app بروید
2. با GitHub لاگین کنید
3. "New Project" → "Deploy from GitHub repo"
4. Repository را انتخاب کنید
5. Environment Variables را اضافه کنید
6. دیپلوی کنید

---

## نکات مهم

✅ STUN/TURN سرورها تنظیم شده‌اند
✅ تماس از اینترنت عمومی کار می‌کند
✅ سرویس Render رایگان است (با محدودیت: 750 ساعت در ماه)

⚠️ در پلن رایگان Render، سرور بعد از 15 دقیقه بدون فعالیت خاموش می‌شود و اولین درخواست کمی طول می‌کشد.
