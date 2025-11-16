# 🚂 نشر خادم البث الصوتي على Railway.app

## لماذا Railway؟
- ✅ مجاني للبداية (500 ساعة/شهر)
- ✅ سهل الاستخدام
- ✅ دعم WebSocket
- ✅ SSL/TLS تلقائي
- ✅ نشر تلقائي من GitHub

---

## 📋 الخطوات

### 1. إنشاء حساب على Railway

1. اذهب إلى [railway.app](https://railway.app)
2. اضغط "Start a New Project"
3. سجل دخول باستخدام GitHub

### 2. إنشاء مشروع جديد

#### الطريقة الأولى: من GitHub (موصى به)

1. **رفع الكود إلى GitHub:**
   ```bash
   # في مجلد server/
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/audio-server.git
   git push -u origin main
   ```

2. **في Railway:**
   - اضغط "New Project"
   - اختر "Deploy from GitHub repo"
   - اختر المستودع
   - Railway سيكتشف تلقائياً أنه مشروع Node.js

#### الطريقة الثانية: رفع مباشر

1. **تثبيت Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **تسجيل الدخول:**
   ```bash
   railway login
   ```

3. **إنشاء مشروع:**
   ```bash
   cd server
   railway init
   ```

4. **نشر:**
   ```bash
   railway up
   ```

### 3. إضافة متغيرات البيئة

في لوحة تحكم Railway:

1. اذهب إلى "Variables"
2. أضف المتغيرات التالية:

```
PORT=8080
NODE_ENV=production
ALLOWED_ORIGINS=https://treeapps.net,https://www.treeapps.net
```

### 4. الحصول على URL

1. بعد النشر، اذهب إلى "Settings"
2. في قسم "Domains"، اضغط "Generate Domain"
3. ستحصل على URL مثل: `your-app.up.railway.app`

### 5. تحديث التطبيق الرئيسي

في ملف `.env.production` في المشروع الرئيسي:

```env
VITE_AUDIO_WS_URL=wss://your-app.up.railway.app
```

### 6. إعادة بناء ونشر التطبيق

```bash
# في المجلد الرئيسي
npm run build
powershell -ExecutionPolicy Bypass -File prepare-hostinger.ps1
```

ثم ارفع الملفات إلى Hostinger.

---

## 🧪 اختبار

### اختبار الخادم:

```bash
# Health check
curl https://your-app.up.railway.app/health

# عرض الغرف
curl https://your-app.up.railway.app/rooms
```

### اختبار WebSocket من المتصفح:

```javascript
const ws = new WebSocket('wss://your-app.up.railway.app');
ws.onopen = () => console.log('✅ Connected to Railway server');
ws.onerror = (e) => console.error('❌ Error:', e);
```

---

## 📊 المراقبة

### عرض السجلات:

في لوحة تحكم Railway:
1. اذهب إلى "Deployments"
2. اضغط على آخر deployment
3. اضغط "View Logs"

أو باستخدام CLI:
```bash
railway logs
```

### مراقبة الاستخدام:

1. اذهب إلى "Usage"
2. تحقق من:
   - ساعات التشغيل
   - استخدام الذاكرة
   - استخدام الشبكة

---

## 🔄 التحديثات التلقائية

إذا استخدمت GitHub:

1. كل push إلى main سيؤدي إلى نشر تلقائي
2. يمكنك تعطيل هذا من "Settings" → "Deployments"

---

## 💰 التكلفة

### الخطة المجانية:
- ✅ 500 ساعة/شهر
- ✅ 512 MB RAM
- ✅ 1 GB Disk
- ✅ Shared CPU

### إذا احتجت أكثر:
- خطة Hobby: $5/شهر
- خطة Pro: $20/شهر

---

## 🆘 حل المشاكل

### المشكلة: "Build failed"

**الحل:**
1. تأكد من وجود `package.json`
2. تأكد من وجود `start` script:
   ```json
   "scripts": {
     "start": "node audio-room-server.js"
   }
   ```

### المشكلة: "Port already in use"

**الحل:**
استخدم متغير البيئة `PORT`:
```javascript
const PORT = process.env.PORT || 8080;
```

### المشكلة: "WebSocket connection failed"

**الحل:**
1. تأكد من استخدام `wss://` (وليس `ws://`)
2. تأكد من إضافة النطاق في `ALLOWED_ORIGINS`
3. تحقق من السجلات في Railway

---

## 📚 مراجع

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [WebSocket on Railway](https://docs.railway.app/guides/websockets)

