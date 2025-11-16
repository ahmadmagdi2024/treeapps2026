# 🎙️ Audio Room WebSocket Server

## نظام بث صوتي محلي - بديل LiveKit

خادم WebSocket بسيط لإدارة البث الصوتي المباشر باستخدام WebRTC.

---

## 🚀 التشغيل السريع

### 1. تثبيت Dependencies:
```bash
npm install
```

### 2. تشغيل السيرفر:
```bash
npm start
```

### 3. للتطوير (مع auto-reload):
```bash
npm run dev
```

---

## 📡 المنافذ

- **WebSocket**: `ws://localhost:8080`
- **HTTP API**: `http://localhost:8080`

---

## 🔧 API

### WebSocket Events

#### Client → Server:
- `join` - الانضمام لغرفة
- `leave` - مغادرة غرفة
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate
- `mute` - كتم الصوت

#### Server → Client:
- `joined` - تم الانضمام
- `participant-joined` - مشارك جديد
- `participant-left` - مشارك غادر
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate

### HTTP Endpoints

```bash
GET /health              # Health check
GET /rooms               # جميع الغرف النشطة
GET /rooms/:roomId       # معلومات غرفة محددة
```

---

## 🏗️ البنية

```
server/
├── audio-room-server.js    # الخادم الرئيسي
├── package.json            # Dependencies
└── README.md              # هذا الملف
```

---

## 🔒 الأمان

⚠️ **ملاحظة:** هذا السيرفر للتطوير المحلي فقط!

للإنتاج، يجب إضافة:
- ✅ Authentication
- ✅ Rate limiting
- ✅ HTTPS/WSS
- ✅ Input validation

---

## 📊 المراقبة

```bash
# عرض الحالة
curl http://localhost:8080/health

# عرض الغرف النشطة
curl http://localhost:8080/rooms
```

---

## 🐛 حل المشاكل

### السيرفر لا يعمل:
```bash
# تحقق من المنفذ
netstat -ano | findstr :8080

# أوقف العملية إذا كانت تعمل
taskkill /PID <PID> /F
```

### خطأ في Dependencies:
```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules
npm install
```

---

## 📝 License

MIT

