require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const TelegramBot = require("node-telegram-bot-api").default;
const orderRoutes = require("./routes/orderRoutes");

connectDB().catch(() => {
  // MongoDB connection is optional for booting the service.
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/shop");
});

app.get("/shop", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "shop.html"));
});

app.use("/api/orders", orderRoutes);

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000/shop";
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.deleteWebhook().catch(() => {
  // Ignore webhook cleanup errors.
});

// ==========================================
// کدهای جدید: منوی اصلی و دکمه‌های شیشه‌ای
// ==========================================
bot.onText(/\/(start|menu)/, (msg) => {
  const chatId = msg.chat.id;

  const dashboardMenu = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🛒 ورود به مینی‌شاپ (Web App)",
            web_app: { url: frontendUrl },
          },
        ],
        [{ text: "🔍 جستجوی محصول", callback_data: "action_search" }],
        [
          { text: "🔥 محبوب‌ترین‌ها", callback_data: "action_popular" },
          { text: "🆕 جدیدترین‌ها", callback_data: "action_latest" },
        ],
        [{ text: "👤 داشبورد کاربری من", callback_data: "action_profile" }],
        [{ text: "📞 پشتیبانی", callback_data: "action_support" }],
      ],
    },
  };

  bot.sendMessage(
    chatId,
    "🌟 *به مینی‌شاپ ما خوش آمدید!*\n\nاز طریق دکمه اول می‌توانید مستقیماً وارد فروشگاه شوید، یا از منوی زیر برای امکانات ربات استفاده کنید:",
    {
      parse_mode: "Markdown",
      ...dashboardMenu,
    },
  );
});

// ==========================================
// کدهای جدید: عملکرد کلیک روی دکمه‌ها
// ==========================================
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "action_popular") {
    const productsMenu = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "محصول شماره ۱", callback_data: "item_1" }],
          [{ text: "محصول شماره ۲", callback_data: "item_2" }],
          [{ text: "⬅️ بازگشت به منوی اصلی", callback_data: "action_back" }],
        ],
      },
    };

    bot.editMessageText(
      "🔥 *لیست محبوب‌ترین محصولات:*\n\nبرای دیدن جزئیات کلیک کنید:",
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: "Markdown",
        ...productsMenu,
      },
    );
  } else if (data === "action_profile") {
    const profileText =
      "📊 *داشبورد کاربری شما*\n\n" +
      "🔸 **شناسه تلگرام:** `" +
      chatId +
      "`\n" +
      "🔸 **تعداد سفارشات:** ۰\n\n" +
      "چه کاری می‌خواهید انجام دهید؟";

    const profileMenu = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📦 پیگیری سفارشات", callback_data: "action_orders" }],
          [{ text: "⬅️ بازگشت به منوی اصلی", callback_data: "action_back" }],
        ],
      },
    };

    bot.editMessageText(profileText, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      ...profileMenu,
    });
  } else if (data === "action_back") {
    const dashboardMenu = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🛒 ورود به مینی‌شاپ (Web App)",
              web_app: { url: frontendUrl },
            },
          ],
          [{ text: "🔍 جستجوی محصول", callback_data: "action_search" }],
          [
            { text: "🔥 محبوب‌ترین‌ها", callback_data: "action_popular" },
            { text: "🆕 جدیدترین‌ها", callback_data: "action_latest" },
          ],
          [{ text: "👤 داشبورد کاربری من", callback_data: "action_profile" }],
          [{ text: "📞 پشتیبانی", callback_data: "action_support" }],
        ],
      },
    };

    bot.editMessageText(
      "🌟 *به مینی‌شاپ ما خوش آمدید!*\n\nلطفاً از منوی زیر یکی از گزینه‌ها را انتخاب کنید:",
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: "Markdown",
        ...dashboardMenu,
      },
    );
  }

  bot.answerCallbackQuery(query.id);
});

// ==========================================
// پایان کدهای جدید
// ==========================================

bot.on("polling_error", (error) => {
  console.log("Bot Polling Error:", error.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in production mode on port ${PORT}`);
});
