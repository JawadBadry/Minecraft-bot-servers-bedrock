const express = require('express');
const path = require('path');
const bedrock = require('bedrock-protocol');

const app = express();
app.use(express.json());

// تقديم ملفات الواجهة الأمامية تلقائياً
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/start-bot', (req, res) => {
    const { ip, port, botName } = req.body;

    if (!ip || !port) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال IP والـ Port بشكل صحيح' });
    }

    const targetPort = parseInt(port) || 19132;
    const cleanBotName = botName ? botName.trim() : 'AFK_Bot';

    console.log(`[BOT REQUEST] Connecting to ${ip}:${targetPort} as ${cleanBotName}`);

    try {
        const client = bedrock.createClient({
            host: ip,
            port: targetPort,
            username: cleanBotName,
            offline: true,
            connectTimeout: 15000
        });

        let responded = false;

        client.on('join', () => {
            console.log(`[BOT JOINED] ${cleanBotName} entered the world!`);
            if (!responded) {
                responded = true;
                return res.json({
                    success: true,
                    message: `نجح الاتصال! دخل البوت (${cleanBotName}) إلى السيرفر وهو متصل الآن.`
                });
            }
        });

        client.on('error', (err) => {
            console.error(`[BOT ERROR]`, err.message);
            if (!responded) {
                responded = true;
                return res.status(500).json({
                    success: false,
                    message: `فشل الدخول: ${err.message}`
                });
            }
        });

        setTimeout(() => {
            if (!responded) {
                responded = true;
                return res.status(408).json({
                    success: false,
                    message: 'انتهت مهلة الاتصال. تأكد من أن السيرفر يعتمد الوضع غير الموثق (Cracked/Offline).'
                });
            }
        }, 12000);

    } catch (error) {
        return res.status(500).json({ success: false, message: 'خطأ في النظام: ' + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});