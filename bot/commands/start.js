import { INITIAL_SESSION } from '../constants/index.js'

export const startBot = bot => {
  bot.onText(/\/start|\/echo/, async msg => {
    const { id: chatId } = msg.chat
    const msgId = msg.message_id
    const { id } = msg.from
    const options = {
      parse_mode: 'HTML',
      reply_to_message_id: msgId
    }
    msg['ctx'] = INITIAL_SESSION
    try {
      await bot.sendMessage(
        chatId,
        `
Лучший бот для использования нейросетей. 

Чтобы создать текст, можно использовать команду /text, для создания изображений — команду /image, для расшифровки аудио - /audio, для перевода видео на другие языки - /video.

Преимущества:
📝 GPT-4 128k, Claude, Google Gemini, Perplexity, Meta Llama и десятки других моделей
🖼 20+ моделей изображений, включая Midjourney 6
💬 Бот помнит историю диалога
🎞 Переводит видео на другие языки
🗣 Голосовой ввод
🆘 Оперативная поддержка на связи 24/7
🤝 Реферальная программа с возможностью заработка
🌐 Встроенный автопереводчик
👥 Работает в группах
🧘 Без рекламы
🕸 Без VPN
🆓 Бесплатный пробный период
🏦 20 методов оплаты для людей из 190+ стран

Баланс: 0 /pay`,
        options
      )
    } catch (error) {
      await bot.sendMessage(chatId, `${error.message}`, options)
    }
  })
}
