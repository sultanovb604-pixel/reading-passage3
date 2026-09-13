# Telegram uslubidagi 2-bosqichli Telefon orqali Kirish (Phone Auth)

Ushbu oʻquv loyihasi Telegram Web dizayniga asoslangan 2 bosqichli autentifikatsiya tizimini (Phone Auth) toʻliq oʻz ichiga oladi.

## 📂 Loyiha tuzilmasi

```text
phone-auth/
├── index.html        # Frontend (HTML5, toza CSS3 va Vanilla JavaScript)
├── server.js          # Backend (Node.js, Express, CORS, In-Memory Map, faylga log yozish)
├── log.txt            # Barcha kirish va tasdiqlash operatsiyalari qaydnomasi
├── package.json       # Loyiha sozlamalari va bog'liqliklar
└── test-api.js        # Avtomatlashtirilgan test skripti
```

## 🚀 Ishga tushirish yoʻriqnomasi

### 1. Bogʻliqliklarni oʻrnatish
Agar dependencies oʻrnatilmagan boʻlsa:
```bash
npm install
```

### 2. Serverni ishga tushirish
```bash
npm start
# yoki:
node server.js
```

Server ishga tushgach:
- Brauzerda oching: **`http://localhost:3000`**
- CORS yoqilganligi sababli, `index.html` faylini toʻgʻridan-toʻgʻri brauzerda ochib ishlatish ham mumkin.

### 3. Avtomatik testni yurgizish
```bash
node test-api.js
```

---

## ⚙️ Ishlash prinsipi

1. **1-bosqich (Telefon raqam kiritish):**
   - Foydalanuvchi Oʻzbekiston raqamini (`+998 XX XXX XX XX`) kiritadi.
   - `Next` tugmasi bosilganda `POST /api/send-code` soʻrovi yuboriladi.
   - Server 5 xonali tasodifiy kod yaratadi, uni server konsoliga yaqqol koʻrinadigan bannerda chiqaradi va `log.txt` fayliga yozadi.
   - Kod xotirada (Map) **2 daqiqa (120 soniya)** davomida saqlanadi.

2. **2-bosqich (5 xonali OTP kod kiritish):**
   - Foydalanuvchi 5 ta alohida kvadrat katakchalarga kodni kiritadi.
   - Har bir raqam yozilganda kursor avtomatik keyingi katakka oʻtadi.
   - `Backspace` bosilganda oldingi katakka qaytib, uni tozalaydi.
   - Butun kodni birdaniga nusxalab (`Ctrl+V`) joylash (Paste) imkoniyati mavjud.
   - 5-raqam kiritilganda yoki `Next` bosilganda `POST /api/verify-code` soʻrovi yuboriladi.
   - Notoʻgʻri kod kiritilsa, forma tebranadi (shake animatsiya) va xatolik koʻrsatiladi.
   - Toʻgʻri kiritilsa, "Muvaffaqiyatli" ekrani ochiladi.
