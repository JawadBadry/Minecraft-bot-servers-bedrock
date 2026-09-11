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

    console.log(`[BOT] جاري الاتصال بالسيرفر: ${ip}:${port} باسم: ${botName}`);

    try {
        // إنشاء اتصال Bedrock
        const client = bedrock.createClient({
            host: ip,
            port: parseInt(port),
            username: botName || 'AFK_Bot',
            offline: true // لتجربة السيرفرات المفتوحة (Offline Mode)
        });

        let hasResponded = false;

        // عند الانضمام الفعلي للسيرفر
        client.on('join', () => {
            console.log(`[BOT SUCCESS] تم انضمام البوت بنجاح إلى ${ip}:${port}`);
            if (!hasResponded) {
                hasResponded = true;
                return res.json({ 
                    success: true, 
                    message: `تم دخول البوت (${botName}) للعبة بنجاح وهو متصل الآن!` 
                });
            }
        });

        // التعامل مع الأخطاء وإغلاق الاتصال
        client.on('error', (err) => {
            console.error('[BOT ERROR]', err.message);
            if (!hasResponded) {
                hasResponded = true;
                return res.status(500).json({ 
                    success: false, 
                    message: `فشل دخول البوت: ${err.message}` 
                });
            }
        });

        client.on('disconnect', (packet) => {
            console.log('[BOT DISCONNECTED]', packet);
        });

        // في حال استغرق الاتصال أكثر من 15 ثانية دون استجابة
        setTimeout(() => {
            if (!hasResponded) {
                hasResponded = true;
                return res.status(408).json({ 
                    success: false, 
                    message: 'انتهت مهلة الاتصال، تأكد من أن السيرفر يعمل ويعتمد الـ IP والميناء المناسبين.' 
                });
            }
        }, 15000);

    } catch (err) {
        return res.status(500).json({ success: false, message: 'حدث خطأ غير متوقع: ' + err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
