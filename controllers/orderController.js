const Order = require("../models/Order");
const { verifyTelegramWebAppData } = require("../utils/telegramAuth");
const TelegramBot = require("node-telegram-bot-api").default;

// مقداردهی ربات برای ارسال پیام سیستمیک
const botToken = process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const bot = botToken ? new TelegramBot(botToken, { polling: false }) : null;

const createOrder = async (req, res) => {
  try {
    const { initData, orderData } = req.body;

    // ۱. بررسی امنیت: آیا این درخواست واقعاً از تلگرام است؟
    if (!verifyTelegramWebAppData(initData)) {
      return res
        .status(403)
        .json({ success: false, message: "درخواست نامعتبر یا غیرمجاز است" });
    }

    // استخراج اطلاعات کاربر از initData
    const urlParams = new URLSearchParams(initData);
    const user = JSON.parse(urlParams.get("user"));

    // ۲. ذخیره در دیتابیس
    const newOrder = await Order.create({
      telegramUserId: user.id,
      customerName: user.first_name,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
    });

    // ۳. ارسال پیام رسید به پی‌وی کاربر در تلگرام
    if (bot) {
      const receiptMsg = `
🛍 فاکتور سفارش شما:
شماره سفارش: ${newOrder._id}
مبلغ کل: ${newOrder.totalAmount} افغانی
وضعیت: در حال بررسی ⏳

از خرید شما متشکریم!
      `;
      await bot.sendMessage(user.id, receiptMsg);
    }

    // ۴. (اختیاری) ارسال پیام به ادمین فروشگاه
    // await bot.sendMessage(ADMIN_CHAT_ID, 'سفارش جدید دریافت شد!');

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "خطای سرور" });
  }
};

module.exports = { createOrder };
