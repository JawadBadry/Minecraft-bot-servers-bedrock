const express = require('express');
const cors = require('cors');
const bedrock = require('bedrock-protocol');

const app = express();
app.use(cors());
app.use(express.json());

// مصفوفة لحفظ البوتات الشغالة في الذاكرة
const activeBots = [];

app.post('/api/start-bot', (req, res) => {
    const { ip, port, botName } = req.body;

    if (!ip || !port) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال IP والميناء بشكل صحيح' });
    }

    const targetPort = parseInt(port) || 19132;
    const cleanBotName = botName ? botName.trim() : 'AFK_Bot';

    console.log(`[BOT ATTEMPT] Connecting to ${ip}:${targetPort} as ${cleanBotName}`);

    try {
        const client = bedrock.createClient({
            host: ip,
            port: targetPort,
            username: cleanBotName,
            offline: true,
            connectTimeout: 10000
        });

        let responded = false;

        client.on('join', () => {
            console.log(`[BOT JOINED] ${cleanBotName} joined ${ip}`);
            
            // حفظ البوت في القائمة لضمان عدم إغلاقه تلقائياً
            activeBots.push(client);

            if (!responded) {
                responded = true;
                return res.json({
                    success: true,
                    message: `نجح الاتصال! دخل البوت (${cleanBotName}) إلى السيرفر وهو متواجد الآن.`
                });
            }
        });

        client.on('error', (err) => {
            console.error(`[BOT ERROR]`, err);
            if (!responded) {
                responded = true;
                return res.status(500).json({
                    success: false,
                    message: `فشل الاتصال بالسيرفر: ${err.message}`
                });
            }
        });

        client.on('kick', (reason) => {
            console.log(`[BOT KICKED] Reason:`, reason);
        });

        setTimeout(() => {
            if (!responded) {
                responded = true;
                // إذا لم يستجب خلال 12 ثانية نجبر إغلاق العميل لتجنب التعليق
                try { client.close(); } catch(e){}
                return res.status(408).json({
                    success: false,
                    message: 'لم يستجب السيرفر في الوقت المحدد. تأكد أن السيرفر شغال وأن خيار (Cracked) مفعل إذا كان السيرفر أوفلاين.'
                });
            }
        }, 12000);

    } catch (error) {
        return res.status(500).json({ success: false, message: 'حدث خطأ في النظام: ' + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
