const express = require('express');
const cors = require('cors');
const bedrock = require('bedrock-protocol');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/start-bot', (req, res) => {
    const { ip, port, botName } = req.body;

    if (!ip || !port) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال IP والميناء بشكل صحيح' });
    }

    try {
        console.log(`محاولة تشغيل البوت ${botName} على السيرفر: ${ip}:${port}`);

        // إنشاء الاتصال بسيرفر Bedrock
        const client = bedrock.createClient({
            host: ip,
            port: parseInt(port),
            username: botName,
            offline: true
        });

        client.on('join', () => {
            console.log(`تم دخول البوت بنجاح إلى ${ip}`);
        });

        client.on('error', (err) => {
            console.error('خطأ في البوت:', err.message);
        });

        return res.json({ 
            success: true, 
            message: `تم إرسال البوت (${botName}) بنجاح للسيرفر ${ip}:${port}` 
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'حدث خطأ أثناء تشغيل البوت: ' + err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل الآن على: http://localhost:${PORT}`);
});