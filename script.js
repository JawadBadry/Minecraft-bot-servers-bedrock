// دالة تحويل الأرقام العربية إلى إنجليزية
function parseArabicNumbers(str) {
    const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    if (typeof str === 'string') {
        for (let i = 0; i < 10; i++) {
            str = str.replace(arabicNumbers[i], i);
        }
    }
    return str;
}

document.getElementById('botForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const ip = document.getElementById('ip').value.trim();
    const rawPort = document.getElementById('port').value.trim();
    const botName = document.getElementById('botName').value.trim();
    const statusBox = document.getElementById('statusBox');
    const statusText = document.getElementById('statusText');

    // تحويل الـ Port والـ IP لأرقام إنجليزية
    const cleanPort = parseInt(parseArabicNumbers(rawPort));
    const cleanIp = parseArabicNumbers(ip);

    statusBox.classList.remove('hidden');
    statusText.innerText = "⏳ جاري إرسال الطلب للخادم...";
    statusText.style.color = "#ffffff";

    if (isNaN(cleanPort)) {
        statusText.innerText = "❌ يرجى إدخال رقم ميناء (Port) صحيح";
        statusText.style.color = "#f87171";
        return;
    }

    try {
        // الربط المباشر مع سيرفر Render الخاص بك
        const response = await fetch('https://minecraft-bot-servers-bedrock.onrender.com/api/start-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: cleanIp, port: cleanPort, botName })
        });

        const data = await response.json();
        
        if (data.success) {
            statusText.innerText = "✅ " + data.message;
            statusText.style.color = "#4ade80";
        } else {
            statusText.innerText = "❌ " + data.message;
            statusText.style.color = "#f87171";
        }
    } catch (error) {
        statusText.innerText = "⚠️ تعذر الاتصال بالخادم (قد يحتاج Render بضع ثوانٍ للاستيقاظ إذا كان خاملاً)";
        statusText.style.color = "#fbbf24";
    }
});
