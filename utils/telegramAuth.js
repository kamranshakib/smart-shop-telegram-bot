const crypto = require('crypto');

const verifyTelegramWebAppData = (telegramInitData) => {
  // تبدیل دیتای دریافتی به فرمت استاندارد برای هش کردن
  const urlParams = new URLSearchParams(telegramInitData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  // مرتب‌سازی پارامترها بر اساس حروف الفبا
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // ساخت کلید مخفی با توکن ربات
  const secretKey = crypto.createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();

  // مقایسه هش تولید شده با هش ارسالی
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
};

module.exports = { verifyTelegramWebAppData };