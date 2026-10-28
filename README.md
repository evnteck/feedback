# Evnteck — رابط تقييم العملاء

صفحة تقييم احترافية (عربي/إنجليزي) لخدمات تأجير الشاشات التفاعلية، مستضافة مجاناً على **GitHub Pages**، والردود تُحفظ تلقائياً في **Google Sheets**.

## الملفات
| الملف | الوظيفة |
|---|---|
| `index.html` | صفحة التقييم للعملاء |
| `admin.html` | لوحة الأدمن: كل الردود + إحصائيات + تصدير PDF و Excel |
| `google-apps-script.gs` | كود يستقبل الردود ويحفظها في Google Sheet |
| `assets/` | الشعار (أبيض وملوّن) والأيقونة — مستخرجة من دليل الهوية |

---

## الخطوة 1: تجهيز Google Sheets (5 دقائق)
1. افتح [sheets.new](https://sheets.new) وسمّه مثلاً **Evnteck Feedback**.
2. من القائمة: **Extensions → Apps Script**.
3. احذف الكود الموجود والصق محتوى `google-apps-script.gs` كاملاً، ثم احفظ (Ctrl+S).
4. (اختياري) إذا أنشأت المشروع من script.google.com مباشرة، ضع رقم الـ Sheet في `SHEET_ID` — تلقاه في رابط الملف بين `/d/` و `/edit`.
   ضع كلمة مرور قوية في `ADMIN_PASSWORD` (هذه كلمة دخول صفحة الأدمن).
   (اختياري) ضع إيميلك في `NOTIFY_EMAIL` لتصلك تنبيهات التقييمات المنخفضة.
5. اضغط **Deploy → New deployment** ← اختر النوع **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. اضغط **Deploy** ووافق على الصلاحيات (Advanced → Go to project).
7. انسخ رابط **Web app URL** (ينتهي بـ `/exec`).

## الخطوة 2: ربط الصفحة بالـ Sheet
افتح `index.html` **و** `admin.html` وضع نفس الرابط في الملفين:
```js
const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/XXXX/exec",
  GOOGLE_REVIEW_URL: ""   // اختياري: رابط تقييم Google Maps
};
```
> إذا أضفت `GOOGLE_REVIEW_URL`، العملاء اللي يعطون 4-5 نجوم يظهر لهم زر لتقييمكم على Google.

## الخطوة 3: الرفع على GitHub
1. سجّل دخول في [github.com](https://github.com) ← **New repository**.
2. الاسم: `evnteck-feedback` ← **Public** ← **Create repository**.
3. اضغط **uploading an existing file** واسحب `index.html` ومجلد `assets` كاملاً (و `README.md` إن أردت) ← **Commit changes**.
4. من **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)** ← **Save**
5. بعد 1-2 دقيقة يصبح الرابط جاهزاً:
   ```
   https://<اسم-حسابك>.github.io/evnteck-feedback/
   ```

### أو عبر سطر الأوامر
```bash
cd evnteck-feedback
git init && git add . && git commit -m "Evnteck feedback page"
git branch -M main
git remote add origin https://github.com/<USERNAME>/evnteck-feedback.git
git push -u origin main
```

---

## صفحة الأدمن
- الرابط: `https://<اسم-حسابك>.github.io/evnteck-feedback/admin.html`
- تدخل بكلمة المرور `ADMIN_PASSWORD`. الصفحة لا تحتوي أي بيانات، وكل شيء يُجلب من الـ Sheet بعد التحقق.
- فيها: عدد التقييمات، المتوسط، مؤشر التوصية NPS، نسبة الرضا، التقييمات اللي تحتاج متابعة، وبحث وفلترة بالفترة والتقييم.
- **تصدير PDF:** زر «تصدير PDF» ← اختر **Save as PDF / حفظ كـ PDF**. التقرير يطبع حسب الفلاتر الحالية.
- **Excel:** يحمّل ملف CSV يفتح مباشرة في Excel بالعربي.
- تتحدث تلقائياً كل دقيقتين، وزر الاتصال/واتساب جاهز لكل عميل ترك رقمه.
- بدون `SCRIPT_URL` تفتح الصفحة في **وضع تجريبي** ببيانات وهمية للمعاينة.

> ⚠️ أي تعديل على `google-apps-script.gs` لازم بعده: **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. بهذي الطريقة يبقى الرابط نفسه ولا تحتاج تغيّره في الصفحات.

## نصائح للاستخدام
- **رابط بالإنجليزي مباشرة:** أضف `?lang=en` في آخر الرابط.
- **تتبع المصدر:** أضف `?ref=whatsapp` أو `?ref=qr` — يظهر في عمود "المصدر" بالـ Sheet.
- **QR Code:** حوّل الرابط لـ QR وضعه على الشاشات أو الفواتير بعد الفعالية.
- **رابط مخصص:** من Settings → Pages → Custom domain يمكنك استخدام مثل `feedback.eventplus.om`.
- **الهوية:** الألوان (#2C1B47 / #450F67 / #935FC7) والخطوط (IBM Plex Sans Arabic + Clash Display) مأخوذة من دليل هوية EventPlus، وتقدر تعدلها من قسم `:root` في `index.html`.

## اختبار
بعد الربط، افتح الرابط وأرسل تقييماً تجريبياً، وتأكد أنه ظهر في تبويب **Responses** في الـ Sheet.
