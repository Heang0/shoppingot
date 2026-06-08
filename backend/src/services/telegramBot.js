import TelegramBot from 'node-telegram-bot-api';
import Store from '../models/Store.js';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

if (token) {
  bot = new TelegramBot(token, { polling: true });

  bot.onText(/^\/link\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const storeId = match[1].trim();

    try {
      const store = await Store.findById(storeId);
      if (!store) {
        return bot.sendMessage(chatId, `❌ Error: Store with ID "${storeId}" not found.`);
      }

      store.telegramGroupId = chatId.toString();
      await store.save();

      const successMsg = `✅ *Success! (ជោគជ័យ!)*\n\nThis chat is successfully linked to the store: *${store.name}*.\nការភ្ជាប់ទៅកាន់ហាង *${store.name}* ទទួលបានជោគជ័យ។\n\nYou will now receive all new order notifications here.\nលោកអ្នកនឹងទទួលបានការជូនដំណឹងពីការបញ្ជាទិញថ្មីៗនៅទីនេះ។`;
      bot.sendMessage(chatId, successMsg, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Error linking telegram group:', err);
      bot.sendMessage(chatId, `❌ An error occurred while linking the store. Please make sure the Store ID is correct.`);
    }
  });

  bot.on('polling_error', (error) => {
    console.error('Telegram Bot Polling Error:', error.code, error.message);
  });
} else {
  console.log('⚠️ TELEGRAM_BOT_TOKEN not found in .env. Telegram Bot is disabled.');
}

export const sendTelegramNotification = async (chatId, message) => {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Failed to send telegram message:', err);
  }
};

export default bot;
